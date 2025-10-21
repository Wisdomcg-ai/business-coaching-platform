// /app/api/xero/callback/route.ts
// This handles the return from Xero after user authorizes

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Get environment variables
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID!;
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NODE_ENV === 'production'
  ? 'https://your-domain.com/api/xero/callback'  // Update this with your real domain
  : 'http://localhost:3000/api/xero/callback';

// Xero token URL
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';
const XERO_CONNECTIONS_URL = 'https://api.xero.com/connections';

export async function GET(request: NextRequest) {
  try {
    // Get code and state from query params
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for errors from Xero
    if (error) {
      console.error('Xero returned error:', error);
      return NextResponse.redirect('/integrations?error=xero_denied');
    }

    if (!code || !state) {
      console.error('Missing code or state');
      return NextResponse.redirect('/integrations?error=missing_params');
    }

    // Decode the state to get business_id
    let businessId: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      businessId = stateData.business_id;
    } catch (e) {
      console.error('Invalid state:', e);
      return NextResponse.redirect('/integrations?error=invalid_state');
    }

    // Step 1: Exchange code for tokens
    console.log('Exchanging code for tokens...');
    
    // Create the authorization header
    const authHeader = Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64');
    
    // Prepare the token request
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    });

    // Make the token request
    const tokenResponse = await fetch(XERO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return NextResponse.redirect('/integrations?error=token_exchange_failed');
    }

    const tokens = await tokenResponse.json();
    console.log('Got tokens successfully');

    // Step 2: Get tenant information
    console.log('Getting tenant information...');
    
    const connectionsResponse = await fetch(XERO_CONNECTIONS_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!connectionsResponse.ok) {
      console.error('Failed to get connections');
      return NextResponse.redirect('/integrations?error=connections_failed');
    }

    const connections = await connectionsResponse.json();
    
    if (!connections || connections.length === 0) {
      console.error('No Xero organizations found');
      return NextResponse.redirect('/integrations?error=no_organizations');
    }

    // Use the first organization (tenant)
    const tenant = connections[0];
    console.log('Using tenant:', tenant.tenantName);

    // Step 3: Calculate token expiry
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    // Step 4: Save to database
    console.log('Saving connection to database...');
    
    // First, delete any existing connection for this business
    await supabase
      .from('xero_connections')
      .delete()
      .eq('business_id', businessId);

    // Insert the new connection
    const { data, error: dbError } = await supabase
      .from('xero_connections')
      .insert({
        business_id: businessId,
        tenant_id: tenant.tenantId,
        tenant_name: tenant.tenantName,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
        connection_status: 'active'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.redirect('/integrations?error=database_error');
    }

    console.log('Connection saved successfully');

    // Redirect back to the integrations page with success
    return NextResponse.redirect('/integrations?success=connected');
    
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect('/integrations?error=unknown_error');
  }
}