import fs from 'fs';
import path from 'path';

const logPath = 'C:\\Users\\Bishop Nyasha\\.gemini\\antigravity\\brain\\3f2849b3-e8ed-48e3-95a9-81c2d86848a5\\.system_generated\\logs\\transcript.jsonl';
const outputMdPath = 'c:\\Users\\Bishop Nyasha\\Desktop\\Projects\\CSE 340\\coaching_session_transcript.md';
const outputTxtPath = 'c:\\Users\\Bishop Nyasha\\Desktop\\Projects\\CSE 340\\coaching_session_transcript.txt';

function parseTranscript() {
    try {
        const fileContent = fs.readFileSync(logPath, 'utf8');
        const lines = fileContent.trim().split('\n');
        
        let outputContent = "Week 05 Coaching Session Transcript\n\n";
        outputContent += `Date: ${new Date().toLocaleDateString()}\n`;
        outputContent += `Participant: Bishop Nyasha (User) & Antigravity (AI Learning Coach & Software Mentor)\n\n`;
        outputContent += `=========================================\n\n`;

        for (const line of lines) {
            if (!line.trim()) continue;
            const step = JSON.parse(line);
            
            // Check for user inputs
            if (step.type === 'USER_INPUT' && step.content) {
                let cleanContent = step.content;
                if (cleanContent.includes('<USER_REQUEST>')) {
                    cleanContent = cleanContent.replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/g, '$1').trim();
                }
                
                if (cleanContent === 'can you run this project' || cleanContent === 'npm run dev') {
                    continue;
                }
                
                outputContent += `User (Bishop Nyasha):\n${cleanContent}\n\n`;
            }
            
            // Check for model responses
            if (step.type === 'PLANNER_RESPONSE' && step.content) {
                let cleanContent = step.content;
                if (!cleanContent.trim()) continue;
                
                outputContent += `AI Coach (Antigravity):\n${cleanContent}\n\n`;
            }
        }
        
        fs.writeFileSync(outputMdPath, outputContent, 'utf8');
        fs.writeFileSync(outputTxtPath, outputContent, 'utf8');
        console.log(`Transcripts successfully written to:\n - ${outputMdPath}\n - ${outputTxtPath}`);
    } catch (error) {
        console.error('Error parsing transcript:', error);
    }
}

parseTranscript();
