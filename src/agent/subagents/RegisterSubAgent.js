import { isLoggedIn, ofRandom } from "../Util";
import AIEmoteType from "../../components/chat/messages/AIEmoteType";

const createRegisterSubAgent = (end) => {

    let stage;
    let username, password, confirmPass;

    const handleInitialize = async (promptData) => {
        console.log("4");
        if (await isLoggedIn()) {
            return end("You already have an account and are logged in! Logout to register a different account.");
        } else {
            stage = "FOLLOWUP_USERNAME";
            return ofRandom([
                "Great! What username would you like to use?",
                "Thanks, what's your username preference?"
            ])
        }
    }

    const handleReceive = async (prompt) => {
        console.log("5");
        switch(stage) {
            case "FOLLOWUP_USERNAME": return await handleFollowupUsername(prompt);
            case "FOLLOWUP_PASSWORD": return await handleFollowupPassword(prompt);
            case "FOLLOWUP_CONFIRMPASS": return await handleFollowupConfirmPassword(prompt);
        }
    }

    const handleFollowupUsername = async (prompt) => {
        console.log("6");
        username = prompt;
        stage = "FOLLOWUP_PASSWORD";
        return {
            msg: ofRandom([
                "Great, and what is your password preference?",
                "Thanks, what password would you like?"
            ]),
            nextIsSensitive: true  
        };
    }

    const handleFollowupPassword = async (prompt) => {
        console.log("7");
        password = prompt;
        stage = "FOLLOWUP_CONFIRMPASS";
        return {
            msg: ofRandom([
                "Lastly, confirm your password.",
                "Thanks, please confirm your password once again."
            ]),
            nextIsSensitive: true  
        };
    }

    const handleFollowupConfirmPassword = async (prompt) => {
        confirmPass = prompt
        if (password != confirmPass) {
            console.log("7");
            return end("Your passwords do not match! Cancelling registration process...");
        } else {
            console.log("8");
            const resp = await fetch("https://cs571.org/api/s24/hw11/register", {
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
                        "Successfully registered!",
                        "Success! You have been registered and logged in."
                    ]),
                    emote: AIEmoteType.SUCCESS
                });
            } else {
                return end({
                    msg: ofRandom([
                        "Sorry, something went wrong! You used an existing username!",
                        "Sorry, contact administrator. You used an exisitng username!"
                    ]),
                    emote: AIEmoteType.ERROR
                });
            }      
        }
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createRegisterSubAgent;