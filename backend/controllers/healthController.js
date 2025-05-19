require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Configuration, OpenAIApi } = require('openai');

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// OpenAI client
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

// 1. Submit health data
async function submitHealth(req, res) {
  const { userId, weight, height, bp, pulse, conditions } = req.body;
  const { data, error } = await supabase
    .from('health_records')
    .insert([{ user_id: userId, weight, height, bp, pulse, conditions }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
}

// 2. Get history
async function getHistory(req, res) {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// 3. Generate plan
async function generatePlan(req, res) {
  const { userId } = req.params;
  const { weight, height, bp, pulse, conditions } = req.body;
  const prompt = `User ID ${userId}, weight ${weight}kg, height ${height}cm, BP ${bp}, pulse ${pulse}, conditions: ${conditions.join(', ')}. Provide a 7-day meal and workout plan.`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  res.json({ plan: completion.data.choices[0].message.content });
}

module.exports = { submitHealth, getHistory, generatePlan };