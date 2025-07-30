// test-gemini.js - Run this to test your Gemini setup
require('dotenv').config();

async function testGemini() {
  console.log('=== GEMINI SETUP TEST ===');
  console.log('1. Environment check:');
  console.log('   - NODE_ENV:', process.env.NODE_ENV);
  console.log('   - GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  console.log('   - API Key length:', process.env.GEMINI_API_KEY?.length || 0);
  console.log('   - API Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in environment variables');
    console.log('\nTo fix this:');
    console.log('1. Create a .env file in your project root');
    console.log('2. Add: GEMINI_API_KEY=your_actual_api_key_here');
    console.log('3. Get your API key from: https://makersuite.google.com/app/apikey');
    return;
  }

  try {
    console.log('\n2. Testing Google Generative AI import...');
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    console.log('✅ Import successful');

    console.log('\n3. Creating Gemini client...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Client created');

    console.log('\n4. Getting model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Model obtained');

    console.log('\n5. Testing simple generation...');
    const result = await model.generateContent('Say hello in JSON format: {"message": "hello"}');
    const response = await result.response;
    const text = await response.text();
    console.log('✅ Generation successful');
    console.log('Response:', text);

    console.log('\n6. Testing question generation...');
    const prompt = `Generate a simple coding question about arrays. Return JSON:
{
  "title": "Question title",
  "description": "Problem description",
  "difficulty": "Easy"
}`;

    const questionResult = await model.generateContent(prompt);
    const questionResponse = await questionResult.response;
    const questionText = await questionResponse.text();
    console.log('✅ Question generation successful');
    console.log('Question response:', questionText);

    console.log('\n🎉 All tests passed! Gemini is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 This looks like an API key issue. Please check:');
      console.log('1. Your API key is correct');
      console.log('2. Your API key has proper permissions');
      console.log('3. You have enabled the Gemini API');
    } else if (error.message.includes('model')) {
      console.log('\n💡 This looks like a model issue. Try:');
      console.log('1. Using "gemini-1.5-pro" instead of "gemini-1.5-flash"');
      console.log('2. Checking available models in Google AI Studio');
    }
  }
}

// Run the test
testGemini();