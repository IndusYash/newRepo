import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const FAQ_DATA = [
  {
    question: "How does this work?",
    answer: "The system works in a very straightforward way. First, it asks you to take a photo of the issue you are noticing — for example, a pothole, broken streetlight, or garbage dump. Along with the photo, the system automatically records your location and pins it on a digital map. The built-in AI then analyses the photo to detect the type of problem. If you feel the AI has missed something, you can manually add details about the issue. Once submitted, the system classifies your report into categories such as road damage, streetlight faults, sanitation issues, and so on. After classification, the report is sent to the concerned authority. An official in charge is assigned, and you will receive updates as the issue moves through the resolution process."
  },
  {
    question: "How to use?",
    answer: "Using the app is designed to be as simple as possible. All you need to do is click a photo of the problem you want to report — that's it. The AI automatically takes care of analysing, categorising, and forwarding the issue. If you are not satisfied with the automatic classification, you also have the option to add additional details or manually correct the category. This way, the system ensures both ease of use and flexibility for more complex reports."
  },
  {
    question: "What is happening now?",
    answer: "Once you have submitted your report, the authorities take over the resolution process. A nodal officer is officially assigned to your case. This officer is responsible for reviewing the issue, coordinating with the relevant department, and ensuring that action is taken. You will continue to get updates as the officer progresses with your case until the issue is resolved."
  },
  {
    question: "What is the status of my request?",
    answer: "You can check the live status of your request in your profile section within the app. The authorities will provide regular updates, such as when an officer has been assigned, when work has started, and when the issue is resolved. This way, you are always kept informed about the progress without needing to chase the authorities separately."
  },
  {
    question: "What can I do if it has not been resolved?",
    answer: "If your reported issue has not been addressed within a reasonable time, you have escalation options. You can directly contact the officer who has been assigned to your case to follow up. If the problem still remains unresolved despite your follow-up, you also have the right to file a formal complaint against the officer or department responsible. This ensures accountability and motivates timely resolution of civic issues."
  }
];

function findFAQMatch(userMessage: string): string | null {
  const message = userMessage.toLowerCase();
  
  // Check for direct matches or similar phrases
  for (const faq of FAQ_DATA) {
    const question = faq.question.toLowerCase();
    
    // Direct similarity check
    if (message.includes(question.replace('?', '')) || question.replace('?', '').includes(message)) {
      return faq.answer;
    }
    
    // Keyword matching
    if (message.includes('how') && message.includes('work') && question.includes('how') && question.includes('work')) {
      return faq.answer;
    }
    if (message.includes('how') && message.includes('use') && question.includes('how') && question.includes('use')) {
      return faq.answer;
    }
    if (message.includes('status') && question.includes('status')) {
      return faq.answer;
    }
    if (message.includes('happening') && message.includes('now') && question.includes('happening') && question.includes('now')) {
      return faq.answer;
    }
    if (message.includes('not') && message.includes('resolved') && question.includes('not') && question.includes('resolved')) {
      return faq.answer;
    }
  }
  
  return null;
}

async function callGemini(messages: any[], newMessage: string): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const faqContext = FAQ_DATA.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');
  
  const conversationHistory = messages.map(msg => 
    `${msg.role}: ${msg.content}`
  ).join('\n');

  const prompt = `You are a friendly assistant that answers based on the provided FAQ context first, then uses general knowledge if needed.

FAQ Context:
${faqContext}

Conversation History:
${conversationHistory}

User: ${newMessage}

Please provide a helpful response. If the question relates to the FAQ topics above, use that information. Otherwise, provide a general helpful response.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini:', error);
    throw new Error('Failed to get response from AI');
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, message } = await req.json();

    if (!userId || !message) {
      return new Response(
        JSON.stringify({ error: 'userId and message are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch last 10 messages for context
    const { data: previousMessages } = await supabaseClient
      .from('messages')
      .select('role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(10);

    // Store user message
    await supabaseClient
      .from('messages')
      .insert({
        user_id: userId,
        role: 'user',
        content: message,
      });

    // Check for FAQ match first
    const faqMatch = findFAQMatch(message);
    let assistantResponse: string;

    if (faqMatch) {
      assistantResponse = faqMatch;
    } else {
      // Call Gemini with context
      assistantResponse = await callGemini(previousMessages || [], message);
    }

    // Store assistant response
    await supabaseClient
      .from('messages')
      .insert({
        user_id: userId,
        role: 'assistant',
        content: assistantResponse,
      });

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});