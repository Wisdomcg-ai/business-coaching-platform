#!/bin/bash

# Find all files with the old import
FILES=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "createClientComponentClient" {} \; 2>/dev/null)

for FILE in $FILES; do
  echo "Fixing: $FILE"
  
  # Replace the import statement
  sed -i '' 's/import { createClientComponentClient } from.*$/import { createBrowserClient } from '\''@supabase\/ssr'\'';/g' "$FILE"
  
  # Replace the function call (basic version)
  sed -i '' 's/const supabase = createClientComponentClient()/const supabase = createBrowserClient(\n  process.env.NEXT_PUBLIC_SUPABASE_URL!,\n  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n)/g' "$FILE"
  
  # Replace with generic parameter
  sed -i '' 's/createClientComponentClient<[^>]*>()/createBrowserClient(\n  process.env.NEXT_PUBLIC_SUPABASE_URL!,\n  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n)/g' "$FILE"
done

echo "Done! Fixed $(echo "$FILES" | wc -l) files."
