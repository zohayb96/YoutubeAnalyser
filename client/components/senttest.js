
// var Sentiment = require('sentiment');
// var sentiment = new Sentiment();

// let sentimentTest = (sentiment.analyze("I love to eat sushi, it is amazing! But, I am allergic to wasabi. "))
// console.log(sentimentTest)

// Output :
// {
//   score: 5,
//   comparative: 0.35714285714285715,
//   calculation: [ { allergic: -2 }, { amazing: 4 }, { love: 3 } ],
//   tokens: [
//     'i',     'love',
//     'to',    'eat',
//     'sushi', 'it',
//     'is',    'amazing',
//     'but',   'i',
//     'am',    'allergic',
//     'to',    'wasabi'
//   ],
//   words: [ 'allergic', 'amazing', 'love' ],
//   positive: [ 'amazing', 'love' ],
//   negative: [ 'allergic' ]
// }


// Returned Objects
// Score: Score calculated by adding the sentiment values of recognized words.
// Comparative: Comparative score of the input string.
// Calculation: An array of words that have a negative or positive valence with their respective AFINN score.
// Token: All the tokens like words or emojis found in the input string.
// Words: List of words from input string that were found in AFINN list.
// Positive: List of positive words in input string that were found in AFINN list.
// Negative: List of negative words in input string that were found in AFINN list.

// Tokenization works by splitting the lines of input string, then removing the special characters, and finally splitting it using spaces. This is used to get list of words in the string.




// ........................

// var documents = text.match( /[^\.!\?]+[\.!\?]+/g );

// LDA
// takes subtitles captions text as a whole and splits into sentences
// Result is an array containing the topics (can be set as a parameeter, possible implemntation later on to let users control the number) - generates x number of topics each with a probability of certainty resulting from running an LDA algorithm on the sentences of text.

Input: 'The weather yesterday at the beach, was sunny, hot and humid. Now, I want to eat an apple, orange, pear and watermelon.';

Output:
[
  [
    { term: 'watermelon', probability: 0.11 },
    { term: 'pear', probability: 0.11 },
    { term: 'orange', probability: 0.11 }
  ],
  [
    { term: 'yesterday', probability: 0.099 },
    { term: 'beach', probability: 0.095 },
    { term: 'hot', probability: 0.094 }
  ]
]
