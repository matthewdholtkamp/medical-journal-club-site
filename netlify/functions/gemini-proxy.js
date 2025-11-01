const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  try {
    const { prompt, operation } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;
    let systemPrompt;
    if (operation === 'followups') {
      systemPrompt = `You are an expert medical researcher who generates five clarifying questions to refine the medical topic: ${prompt}`;
    } else if (operation === 'summary') {
      systemPrompt = `You are a medical research assistant who searches up-to-date, reputable literature from PubMed, NEJM, JAMA and professional guidelines to produce a comprehensive journal club summary with APA citations for: ${prompt}`;
    } else {
      systemPrompt = `You are a medical assistant who extracts high-yield key points from the literature for: ${prompt}`;
    }
    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [
        {
          parts: [
            { text: systemPrompt }
          ]
        }
      ]
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    const text = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || '';
    return {
      statusCode: 200,
      body: JSON.stringify({ result: text.trim() })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
