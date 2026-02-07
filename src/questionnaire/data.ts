/**
 * Questionnaire data
 * Define your welcome screen and questions here
 */

import { QuestionnaireData } from './types';

export const questionnaireData: QuestionnaireData = {
  welcome: {
    image: require('../../assets/laptop-icon.png'), // Replace with your welcome image
    title: '28-Day Money Challenge',
    subtitle: 'start making money online',
    buttonText: 'Get Started',
    termsText: 'By proceeding you agree with our Terms & Conditions, Privacy Policy, Subscription Terms',
  },
  questions: [
    {
      id: 'q1',
      title: 'What is your goal?',
      subtitle: 'What would you like to achieve at the end?',
      answers: [
        {
          id: 'a1',
          text: 'Grow wealth',
          icon: require('../../assets/emojis/moneyEmoji.png'),
        },
        {
          id: 'a2',
          text: 'Be my own boss',
          icon: require('../../assets/emojis/sunglassesEmoji.png'),
        },
        {
          id: 'a3',
          text: 'Retire early',
          icon: require('../../assets/emojis/houseEmoji.png'),
        },
        {
          id: 'a4',
          text: 'Self improvement',
          icon: require('../../assets/emojis/stockIncreasingEmoji.png'),
        },
      ],
    },
    {
      id: 'q2',
      title: 'Where did you hear about us?',
      subtitle: 'Let us know where did you come from!',
      answers: [
        {
          id: 'b1',
          text: 'Instagram',
          icon: require('../../assets/logos/instagramLogo.png'),
        },
        {
          id: 'b2',
          text: 'TikTok',
          icon: require('../../assets/logos/tiktokLogo.png'),
        },
        {
          id: 'b3',
          text: 'Facebook',
          icon: require('../../assets/logos/facebookLogo.png'),
        },
        {
          id: 'b4',
          text: 'Google',
          icon: require('../../assets/logos/googleLogo.png'),
        },
        {
            id: 'b5',
            text: 'Other',
            icon: require('../../assets/emojis/worldEmoji.png'),
          },
      ],
    },
    {
      id: 'q3',
      title: 'When do you want to see results?',
    //   subtitle: 'What would you like to achieve at the end?',
      answers: [
        {
          id: 'c1',
          text: "ASAP (I'm motivated)",
        },
        {
          id: 'c2',
          text: 'Within 30 days',
        },
        {
          id: 'c3',
          text: 'In a few months',
        },
        {
          id: 'c4',
          text: "No rush, I'm learning",
        },
      ],
    },
    {
      type: 'image' as const,
      image: require('../../assets/questionnaire/questionnaireImage1.png'),
      // title: "You're doing great!",
    },
    {
        id: 'q4',
        title: 'Have you ever tried making money online?',
      //   subtitle: 'What would you like to achieve at the end?',
        answers: [
          {
            id: 'd1',
            text: "No",
            icon: require('../../assets/emojis/thumbDownEmoji.png'),
          },
          {
            id: 'd2',
            text: 'Yes',
            icon: require('../../assets/emojis/thumbUpEmoji.png'),
          },
        ],
      },
      {
        id: 'q5',
        title: 'Why are you starting now?',
        subtitle: 'What would you like to achieve at the end?',
        answers: [
          {
            id: 'e1',
            text: 'I need a change',
            icon: require('../../assets/emojis/changeEmoji.png'),
          },
          {
            id: 'e2',
            text: 'I want more freedom',
            icon: require('../../assets/emojis/airplaneEmoji.png'),
          },
          {
            id: 'e3',
            text: 'I’m tired of living poorly',
            icon: require('../../assets/emojis/wearyEmoji.png'),
          },
        ],
      },
      {
        id: 'q6',
        title: 'How confident do you feel right now?',
        // subtitle: 'What would you like to achieve at the end?',
        answers: [
          {
            id: 'f1',
            text: 'Very confident',
            icon: require('../../assets/emojis/sunglassesEmoji.png'),
          },
          {
            id: 'f2',
            text: 'Somewhat confident',
            icon: require('../../assets/emojis/slightlySmilingEmoji.png'),
          },
          {
            id: 'f3',
            text: 'Not very confident',
            icon: require('../../assets/emojis/worriedEmoji.png'),
          },
          {
            id: 'f4',
            text: 'Completely lost',
            icon: require('../../assets/emojis/confusedEmoji.png'),
          },
        ],
      },
      {
        id: 'q7',
        title: 'What’s your biggest struggle right now?',
        // subtitle: 'What would you like to achieve at the end?',
        answers: [
          {
            id: 'g1',
            text: 'Knowing where to start',
            icon: require('../../assets/emojis/roundpinEmoji.png'),
          },
          {
            id: 'g2',
            text: 'Staying consistent',
            icon: require('../../assets/emojis/confusedEmoji.png'),
          },
          {
            id: 'g3',
            text: 'Taking action',
            icon: require('../../assets/emojis/laptopEmoji.png'),
          },
        ],
      },
      {
        id: 'q8',
        title: 'What would success look like for you?',
        subtitle: 'What would you like to achieve at the end?',
        answers: [
          {
            id: 'h1',
            text: 'First $100 online',
            icon: require('../../assets/emojis/dollarEmoji.png'),
          },
          {
            id: 'h2',
            text: 'Consistent income',
            icon: require('../../assets/emojis/moneyBagEmoji.png'),
          },
          {
            id: 'h3',
            text: 'Long-term freedom',
            icon: require('../../assets/emojis/calendarEmoji.png'),
          },
        ],
      },
      {
        id: 'q9',
        title: 'Who are you doing this for?',
        subtitle: 'What would you like to achieve at the end?',
        answers: [
          {
            id: 'i1',
            text: 'Myself',
            icon: require('../../assets/emojis/sunglassesEmoji.png'),
          },
          {
            id: 'i2',
            text: 'My family',
            icon: require('../../assets/emojis/familyEmoji.png'),
          },
          {
            id: 'i3',
            text: 'Someone I want to help',
            icon: require('../../assets/emojis/handshakeEmoji.png'),
          },
          {
            id: 'i4',
            text: 'My future',
            icon: require('../../assets/emojis/hourglassEmoji.png'),
          },
        ],
      },
      {
        id: 'q10',
        title: 'Is there something special you wish to achieve?',
        subtitle: 'What would you like to achieve at the end?',
        answers: [
          {
            id: 'j1',
            text: 'Buy a house',
            icon: require('../../assets/emojis/houseEmoji.png'),
          },
          {
            id: 'j2',
            text: 'Retiring parents',
            icon: require('../../assets/emojis/moneyEmoji.png'),
          },
          {
            id: 'j3',
            text: 'Buy a car',
            icon: require('../../assets/emojis/carEmoji.png'),
          },
          {
            id: 'j4',
            text: 'Vacation',
            icon: require('../../assets/emojis/vacationEmoji.png'),
          },
          {
            id: 'j5',
            text: 'Freedom',
            icon: require('../../assets/emojis/airplaneEmoji.png'),
          },
        ],
      },
      {
        type: 'image' as const,
        image: require('../../assets/questionnaire/handshake3.png'),
        title: "Thank you for trusting us!",
        titlePosition: 'bottom',
        description: "Now let's make your dreams come true with Hustlingo" 
      },
      {
        type: 'input' as const,
        id: 'referral_code',
        title: 'Do you have a referral code?',
        description: 'You can skip this step.',
        placeholder: 'Referral Code',
      }
      ,
      {
        type: 'result' as const,
        title: 'Here is your Money Making probability',
        scoreTitle: 'Readiness score',
        resultLabel: 'Result: Perfect',
        markerLabel: 'Moderate',
        markerValue: 0.75,
        infoTitle: 'Impressive Money Success Score',
        infoText:
          'A 2024 PwC study found that AI professionals in the U.S. earn, on average, 25% more than their non-AI-skilled counterparts in similar roles.',
        stats: [
          {
            title: 'Motivation',
            value: 'High',
            icon: require('../../assets/emojis/stockIncreasingEmoji.png'),
          },
          {
            title: 'Potential',
            value: 'High',
            icon: require('../../assets/emojis/moneyBagEmoji.png'),
          },
          {
            title: 'Focus',
            value: 'Procrastination',
            icon: require('../../assets/emojis/hourglassEmoji.png'),
            muted: true,
          },
          {
            title: 'Knowledge',
            value: 'Intermediate',
            icon: require('../../assets/emojis/laptopEmoji.png'),
            muted: true,
          },
        ],
      },
      {
        type: 'personal_plan' as const,
        title: "We're setting everything up for you",
        phases: [
          'Analysing your profile...',
          'Setting your goals...',
          'Identifying best side hustles...',
          'Curating e-learning path...',
          'Preparing to make first dollar...',
          'Plan ready!'
        ],
        reviews: [
          {
            id: 'r1',
            name: 'Alex M.',
            text: 'I made my first $100 in just 3 days using the strategies here!',
            stars: 5,
            timeAgo: '2m ago'
          },
          {
            id: 'r2',
            name: 'Sarah K.',
            text: 'The step-by-step plan was exactly what I needed to get started.',
            stars: 5,
            timeAgo: '15m ago'
          },
          {
            id: 'r3',
            name: 'David R.',
            text: 'Finally a platform that teaches real, actionable skills.',
            stars: 5,
            timeAgo: '1h ago'
          },
          {
            id: 'r4',
            name: 'Jessica T.',
            text: 'From 0 to $1k/month in 4 weeks. Highly recommend!',
            stars: 5,
            timeAgo: '3h ago'
          }
        ]
      }
  ],
};
