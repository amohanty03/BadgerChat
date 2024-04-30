import { isLoggedIn, ofRandom } from "../Util";
import AIEmoteType from "../../components/chat/messages/AIEmoteType";

const createLoginSubAgent = (end) => {

    let stage;
    let username, password;

    const handleInitialize = async (promptData) => {
        if (await isLoggedIn()) {
            return end("You are already logged in! Logout to sign in with a different account.");
        } else {
            stage = "FOLLOWUP_USERNAME";
            return ofRandom([
                "Great! What is your username?",
                "Thanks, and what is your username?"
            ])
        }
    }

    const handleReceive = async (prompt) => {
        switch(stage) {
            case "FOLLOWUP_USERNAME": return await handleFollowupUsername(prompt);
            case "FOLLOWUP_PASSWORD": return await handleFollowupPassword(prompt);
        }
    }

    const handleFollowupUsername = async (prompt) => {
        username = prompt;
        stage = "FOLLOWUP_PASSWORD";
        return {
            msg: ofRandom([
                "Great, and what is your password?",
                "Thanks, and what is your password?"
            ]),
            nextIsSensitive: true 
        };
    }

    const handleFollowupPassword = async (prompt) => {
        password = prompt;
        const resp = await fetch("https://cs571.org/api/s24/hw11/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CS571-ID": "bid_8502fd1eee835ac0b7b95444697d92bcf26a1d3f6f606a08c9430176cb48a07a",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        
        if (resp.status === 200) {
            return end({
                msg: ofRandom([
                    "Successfully logged in!",
                    "Success! You have been logged in."
                ]),
                emote: AIEmoteType.SUCCESS
            });
        } else {
            return end({
                msg: ofRandom([
                    "Sorry, that username and password is incorrect.",
                    "Sorry, your username or password is incorrect."
                ]),
                emote: AIEmoteType.ERROR
            });
        }      
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createLoginSubAgent;