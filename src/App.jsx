import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, Copy, Check, Lightbulb, X } from 'lucide-react';

// Helper function to format markdown-style text
const formatMessage = (text) => {
  // Convert **bold** to <strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert emoji + text patterns for better styling
  formatted = formatted.replace(/🎯 \*\*Prediction:\*\*/g, '<div class="mt-2"><span class="font-bold text-blue-600">🎯 Prediction:</span>');
  formatted = formatted.replace(/📈 \*\*Churn Probability:\*\*/g, '<div class="mt-1"><span class="font-bold text-purple-600">📈 Churn Probability:</span>');
  formatted = formatted.replace(/⚠️ \*\*Risk Level:\*\*/g, '<div class="mt-1"><span class="font-bold text-orange-600">⚠️ Risk Level:</span>');
  formatted = formatted.replace(/🔴 \*\*Alert:\*\*/g, '<div class="mt-3 p-3 bg-red-50 rounded-lg"><span class="font-bold text-red-600">🔴 Alert:</span>');
  formatted = formatted.replace(/🟡 \*\*Caution:\*\*/g, '<div class="mt-3 p-3 bg-yellow-50 rounded-lg"><span class="font-bold text-yellow-600">🟡 Caution:</span>');
  formatted = formatted.replace(/🟢 \*\*Good News:\*\*/g, '<div class="mt-3 p-3 bg-green-50 rounded-lg"><span class="font-bold text-green-600">🟢 Good News:</span>');
  formatted = formatted.replace(/💡 \*\*Recommendations:\*\*/g, '</div><div class="mt-3"><span class="font-bold text-indigo-600">💡 Recommendations:</span>');
  
  // Convert line breaks
  formatted = formatted.replace(/\n/g, '<br/>');
  
  return formatted;
};

const ChurnChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your e& Egypt Customer Churn Assistant. I can help you predict if a customer is likely to churn. Just tell me about the customer in your own words, or provide their details!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const messagesEndRef = useRef(null);

  // Example customer data with hints for display
  const exampleCustomerWithHints = `customerID: 7590-VHVEG (any unique ID)
gender: Female (Male/Female)
Senior_Citizen: 0 (0=No, 1=Yes)
Is_Married: Yes (Yes/No)
Dependents: No (Yes/No)
tenure: 12 (months with company)
Phone_Service: No (Yes/No)
Dual: No (Yes/No - multiple lines)
Internet_Service: Fiber optic (DSL/Fiber optic/No)
Online_Security: No (Yes/No/No internet service)
Online_Backup: No (Yes/No/No internet service)
Device_Protection: No (Yes/No/No internet service)
Tech_Support: No (Yes/No/No internet service)
Streaming_TV: Yes (Yes/No/No internet service)
Streaming_Movies: Yes (Yes/No/No internet service)
Contract: Month-to-month (Month-to-month/One year/Two year)
Paperless_Billing: Yes (Yes/No)
Payment_Method: Electronic check (Electronic check/Mailed check/Bank transfer (automatic)/Credit card (automatic))
Monthly_Charges: 70.35 (amount in $)
Total_Charges: 844.2 (amount in $)`;

  // Example without hints for copying
  const exampleCustomerClean = `customerID: 7590-VHVEG
gender: Female
Senior_Citizen: 0
Is_Married: Yes
Dependents: No
tenure: 12
Phone_Service: No
Dual: No
Internet_Service: Fiber optic
Online_Security: No
Online_Backup: No
Device_Protection: No
Tech_Support: No
Streaming_TV: Yes
Streaming_Movies: Yes
Contract: Month-to-month
Paperless_Billing: Yes
Payment_Method: Electronic check
Monthly_Charges: 70.35
Total_Charges: 844.2`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exampleCustomerClean);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleUseExample = () => {
    setInput(exampleCustomerClean);
    setShowExamples(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Call backend chatbot endpoint
      const response = await fetch('https://eatask-production.up.railway.app//chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          session_id: sessionId 
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Store session ID for conversation continuity
        if (data.session_id && !sessionId) {
          setSessionId(data.session_id);
        }
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `❌ Error: ${data.message}` 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Sorry, I encountered an error. Please make sure the backend is running and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">e& Egypt Churn Prediction Assistant</h1>
              <p className="text-sm text-gray-500">Powered by Groq AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Example Input Section - Show at top when showExamples is true */}
          {showExamples && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-6 shadow-md animate-in">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Try This Example Customer
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Copy or use this example to see how the prediction works:
                  </p>
                </div>
                <button
                  onClick={() => setShowExamples(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 font-mono text-sm text-gray-700 mb-3 max-h-80 overflow-y-auto shadow-inner">
                <div className="whitespace-pre-line leading-relaxed">
                  {exampleCustomerWithHints.split('\n').map((line, idx) => {
                    const [field, rest] = line.split(': ');
                    const valueMatch = rest?.match(/^(.+?)(\s*\(.*\))?$/);
                    const value = valueMatch?.[1] || rest;
                    const hint = valueMatch?.[2] || '';
                    
                    return (
                      <div key={idx} className="py-0.5">
                        <span className="text-blue-600 font-semibold">{field}</span>
                        {rest && (
                          <>
                            <span className="text-gray-400">: </span>
                            <span className="text-gray-800">{value}</span>
                            {hint && (
                              <span className="text-gray-400 text-xs ml-1">{hint}</span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Copy</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleUseExample}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm font-medium shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  Use This Example
                </button>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                <div 
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the customer or ask a question..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <p>Example: "A female customer, 45 years old, has been with us for 12 months..." or use the example above</p>
            </div>
            
            {!showExamples && (
              <button
                onClick={() => setShowExamples(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shadow-sm"
                title="Show example customer data"
              >
                <Lightbulb className="w-4 h-4" />
                Show Example
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurnChatbot;