import express from 'express';
import twilio from 'twilio';
import axios from 'axios';
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from 'dotenv'; // Step 2: Import dotenv

const { twiml: { VoiceResponse } } = twilio;

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


dotenv.config();

async function query(data) {
    const response = await axios.post(
        "https://aigeenee.chromovision.com/api/v1/prediction/88407ef1-b7b0-4431-b5c5-24df8652e5a1",
        data,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
    return response.data;
}

// Assuming the rest of your code remains the same

app.post('/voice', async (request, response) => {
  console.log('req');
  console.log(request.body);
  const twiml = new VoiceResponse();
  
  console.log('userSpeech', request.body.SpeechResult);
  if (request.body.SpeechResult) {
    console.log('speechFound');
    try {
      const aiResponse = await query({ question: request.body.SpeechResult });
      console.log('airesponse', aiResponse);
      twiml.say(aiResponse.text);
    } catch (error) {
      console.error('Error querying AI Agent:', error);
      twiml.say('Sorry, there was an error processing your request.');
    }
  } else {
    console.log('i am called');
    const gather = twiml.gather({
      input: 'speech',
      timeout: 5,
      speechTimeout: 'auto',
      action: '/voice',
      // The statusCallback attribute is valid here for gather
      statusCallback: '/statusCallback',
    });
    gather.say('Hello my name is absher, How may I help you?');
    twiml.redirect('/voice');
  }

  response.type('text/xml');
  response.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


