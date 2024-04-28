import { isLoggedIn, ofRandom } from "../Util";

const createLoginSubAgent = (end) => {

    let stage;
    let username, password;

    const handleInitialize = async (promptData) => {
        if (await isLoggedIn()) {
            return "You are already logged in! Logout to sign in with a different account."
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
        return ofRandom([
            "Great, and what is your password?",
            "Thanks, and what is your password?"
        ])
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
            return end(ofRandom([
                "Successfully logged in!",
                "Success! You have been logged in."
            ]))
        } else {
            return end(ofRandom([
                "Sorry, that username and password is incorrect.",
                "Sorry, your username or password is incorrect.",
            ]))
        }      
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createLoginSubAgent;