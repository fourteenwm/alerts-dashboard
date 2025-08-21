# API Setup Guide for Data Insights

## Setting Up Your .env File

Your `.env` file should contain your API keys. Here's how to set it up:

### 1. Edit your .env file

Add the following to your `.env` file (replace with your actual API keys):

```
# API Keys for Data Insights
OPENAI_API_KEY=sk-your-openai-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Choose which provider to use by default
DEFAULT_LLM_PROVIDER=openai-gpt-4
```

### 2. Getting API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

#### Google AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

#### Anthropic API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign in or create an account
3. Go to "API Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)

### 3. Security Notes

- ✅ Your `.env` file is already in `.gitignore` - it won't be committed to git
- ✅ Never share your API keys publicly
- ✅ Each API has usage limits and costs - monitor your usage
- ✅ You can use just one API key if you prefer

### 4. Testing Your Setup

1. Add your API key to the `.env` file
2. Restart your development server: `npm run dev`
3. Go to the Data Insights page
4. Select the corresponding AI model
5. Enter a question and test the insights generation

### 5. Troubleshooting

If you get an error like "API key not configured":
- Make sure your `.env` file is in the project root
- Check that the variable name matches exactly (e.g., `OPENAI_API_KEY`)
- Restart your development server after adding the key
- Check the browser console for detailed error messages

### 6. Cost Considerations

- **OpenAI GPT-4**: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- **Google Gemini Pro**: ~$0.0005 per 1K input tokens, ~$0.0015 per 1K output tokens  
- **Anthropic Claude**: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens

For typical data analysis queries, costs are usually under $0.10 per request.
