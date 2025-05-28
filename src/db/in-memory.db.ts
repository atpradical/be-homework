import { Blog } from '../features/blogs/types';
import { Post } from '../features/posts/types';

type DBInMemory = {
  blogs: Blog[];
  posts: Post[];
};

const db: DBInMemory = {
  blogs: [
    {
      id: '1',
      name: 'Tech Today',
      description: 'Blog about the latest in technology and innovation.',
      websiteUrl: 'https://techtoday.example ',
    },
    {
      id: '2',
      name: 'Travel Diaries',
      description:
        'A blog sharing travel experiences and adventures around the world.',
      websiteUrl: 'https://traveldiaries.example ',
    },
    {
      id: '3',
      name: 'Fitness Life',
      description: 'Staying healthy and fit — workouts, diet, and motivation.',
      websiteUrl: 'https://fitnesslife.example ',
    },
    {
      id: '4',
      name: 'Cooking Master',
      description: 'Delicious recipes and cooking tips from around the globe.',
      websiteUrl: 'https://cookingmaster.example ',
    },
    {
      id: '5',
      name: 'Science World',
      description: 'Exploring science, discoveries, and innovations.',
      websiteUrl: 'https://scienceworld.example ',
    },
    {
      id: '6',
      name: 'Art & Design',
      description: 'Creative inspiration from art, design, and culture.',
      websiteUrl: 'https://artanddesign.example ',
    },
    {
      id: '7',
      name: 'Finance Tips',
      description: 'Smart money management, investing, and personal finance.',
      websiteUrl: 'https://financetips.example ',
    },
    {
      id: '8',
      name: 'Programming Hub',
      description: 'Everything about programming, code, and development.',
      websiteUrl: 'https://programminghub.example ',
    },
    {
      id: '9',
      name: 'Movie Reviews',
      description: 'Cinema news, reviews, and behind-the-scenes insights.',
      websiteUrl: 'https://moviereviews.example ',
    },
    {
      id: '10',
      name: 'Nature Lovers',
      description: 'Celebrating nature, wildlife, and environmental awareness.',
      websiteUrl: 'https://naturelovers.example ',
    },
  ],
  posts: [
    {
      id: 'p1',
      title: 'The Future of Technology',
      shortDescription: 'What to expect in tech over the next decade.',
      content:
        'Technology is advancing faster than ever. From AI to quantum computing, this article explores what the future holds for tech enthusiasts.',
      blogId: '1',
      blogName: 'Tech Today',
    },
    {
      id: 'p2',
      title: 'Top 10 Travel Destinations',
      shortDescription: 'Best places to visit this year.',
      content:
        'From tropical beaches to historical landmarks, here are the top 10 must-see destinations for your next adventure.',
      blogId: '2',
      blogName: 'Travel Diaries',
    },
    {
      id: 'p3',
      title: 'Morning Workout Routine',
      shortDescription: 'Quick and effective morning exercises.',
      content:
        'Starting your day with a good workout can boost your energy and mood. Try this simple routine to stay fit and active.',
      blogId: '3',
      blogName: 'Fitness Life',
    },
    {
      id: 'p4',
      title: 'Easy Dinner Recipes',
      shortDescription: 'Tasty meals you can make in under 30 minutes.',
      content:
        'Looking for something quick and delicious? These dinner ideas will save your weeknights with minimal effort and maximum flavor.',
      blogId: '4',
      blogName: 'Cooking Master',
    },
    {
      id: 'p5',
      title: 'The Power of Science',
      shortDescription: 'How science changes our lives daily.',
      content:
        'From medicine to space exploration, science shapes the way we live. This post dives into some of the most impactful scientific breakthroughs.',
      blogId: '5',
      blogName: 'Science World',
    },
    {
      id: 'p6',
      title: 'Design Trends 2025',
      shortDescription: 'What’s new in the world of design.',
      content:
        'Explore the latest trends in graphic design, UI/UX, and architecture shaping the creative world this year.',
      blogId: '6',
      blogName: 'Art & Design',
    },
    {
      id: 'p7',
      title: 'Budget Planning Tips',
      shortDescription: 'How to manage your money wisely.',
      content:
        'Creating a budget is essential for financial stability. Learn how to track expenses and save more effectively.',
      blogId: '7',
      blogName: 'Finance Tips',
    },
    {
      id: 'p8',
      title: 'JavaScript Basics',
      shortDescription: 'Getting started with JS.',
      content:
        'JavaScript is one of the most popular languages today. This beginner-friendly guide introduces the core concepts of JavaScript.',
      blogId: '8',
      blogName: 'Programming Hub',
    },
    {
      id: 'p9',
      title: 'Oscar Winners 2024',
      shortDescription: 'Highlights from this year’s ceremony.',
      content:
        'The Oscars 2024 brought many surprises and unforgettable moments. Here’s a recap of the biggest winners and standout performances.',
      blogId: '9',
      blogName: 'Movie Reviews',
    },
    {
      id: 'p10',
      title: 'Protecting Wildlife',
      shortDescription: 'Why biodiversity matters.',
      content:
        'Preserving ecosystems and protecting endangered species is crucial for the planet. Learn how you can help make a difference.',
      blogId: '10',
      blogName: 'Nature Lovers',
    },
  ],
};
