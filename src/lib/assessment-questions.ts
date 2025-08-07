export const assessmentQuestions = [
  {
    id: 'revenue_stage',
    section: 'foundation',
    type: 'multiple_choice',
    question: "What's your current annual revenue?",
    options: [
      { value: 'under_250k', label: 'Under $250K', score: 2 },
      { value: '250k_1m', label: '$250K - $1M', score: 4 }
    ],
    required: true,
    maxScore: 10
  }
];

export const sectionInfo = {
  foundation: {
    name: 'Business Foundation',
    description: 'Understanding your current position',
    totalQuestions: 1,
    maxScore: 10
  }
};