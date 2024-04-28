import createChatDelegator from "./ChatDelegator";
import { ofRandom } from "./Util";

const createChatAgent = () => {
    const CS571_WITAI_ACCESS_TOKEN = "YKR3CC2JMLS4XV6PPIDS6ZCJ5PLMGQCI"; // Put your CLIENT access token here.

    const delegator = createChatDelegator();

    let chatrooms = [];

    const handleInitialize = async () => {
        const resp = await fetch("https://cs571.org/api/s24/hw11/chatrooms", {
            headers: {
                "X-CS571-ID": CS571.getBadgerId()
            }
        });
        const data = await resp.json();
        chatrooms = data;

        return "Welcome to BadgerChat! My name is Bucki, how can I help you?";
    }

    const handleReceive = async (prompt) => {
        if (delegator.hasDelegate()) { return delegator.handleDelegation(prompt); }
        const resp = await fetch(`https://api.wit.ai/message?q=${encodeURIComponent(prompt)}`, {
            headers: {
                "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
            }
        })
        const data = await resp.json();
        if (data.intents.length > 0) {
            switch (data.intents[0].name) {
                case "get_help": return handleGetHelp();
                case "get_chatrooms": return handleGetChatrooms();
                case "get_messages": return handleGetMessages(data);
                case "login": return handleLogin();
                case "register": return handleRegister();
                case "create_message": return handleCreateMessage(data);
                case "logout": return handleLogout();
                case "whoami": return handleWhoAmI();
            }
        }
        return "Sorry, I didn't get that. Type 'help' to see what you can do!";
    }

    const handleTranscription = async (rawSound, contentType) => {
        const resp = await fetch(`https://api.wit.ai/dictation`, {
            method: "POST",
            headers: {
                "Content-Type": contentType,
                "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
            },
            body: rawSound
        })
        const data = await resp.text();
        const transcription = data
            .split(/\r?\n{/g)
            .map((t, i) => i === 0 ? t : `{${t}`)  // Turn the response text into nice JS objects
            .map(s => JSON.parse(s))
            .filter(chunk => chunk.is_final)       // Only keep the final transcriptions
            .map(chunk => chunk.text)
            .join(" ");                            // And conjoin them!
        return transcription;
    }

    const handleSynthesis = async (txt) => {
        if (txt.length > 280) {
            return undefined;
        } else {
            const resp = await fetch(`https://api.wit.ai/synthesize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "audio/wav",
                    "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
                },
                body: JSON.stringify({
                    q: txt,
                    voice: "Rebecca",
                    style: "soft"
                })
            })
            const audioBlob = await resp.blob()
            return URL.createObjectURL(audioBlob);
        }
    }

    const handleGetHelp = async () => {
        const responses =
        [
            "give me a list of chatrooms",
            "register for an account",
            "what chatrooms are there",
            "get latest post",
            "login"
        ]
        return `Try asking for '${ofRandom(responses)}', or ask for more help!`;
    }

    const handleGetChatrooms = async () => {
        let chatroomStr = chatrooms.join(", ")
        return `Of course, there are ${chatrooms.length} chatrooms: ${chatroomStr}.`
    }

    const handleGetMessages = async (data) => {
        const hasSpecifiedNumber = data.entities["wit$number:number"] ? true : false;
        const numPosts = hasSpecifiedNumber ? data.entities["wit$number:number"][0].value : 1;

        const hasSpecifiedChatroom = data.entities["get_messages:get_messages"] ? true : false;
        const chatroom = hasSpecifiedChatroom ? data.entities["get_messages:get_messages"][0].value : "";

        const resp = await fetch(`https://cs571.org/api/s24/hw11/messages?chatroom=${chatroom}&num=${numPosts}`, {
            method: "GET",
            headers: {
                "X-CS571-ID": "bid_8502fd1eee835ac0b7b95444697d92bcf26a1d3f6f606a08c9430176cb48a07a"
            }
        });
        const posts = await resp.json()
        return posts.messages.map(p => `In ${p.chatroom}, ${p.poster} created a post titled '${p.poster}' saying '${p.content}'`);
    }

    const handleLogin = async () => {
        console.log("1");
        return await delegator.beginDelegation("LOGIN");
    }

    const handleRegister = async () => {
        console.log("2");
        return await delegator.beginDelegation("REGISTER");
    }

    const handleCreateMessage = async (data) => {
        return await delegator.beginDelegation("CREATE");
    }

    const handleLogout = async () => {
        return "I should try to log out..."
    }

    const handleWhoAmI = async () => {
        return "I should see who I am..."
    }

    return {
        handleInitialize,
        handleReceive,
        handleTranscription,
        handleSynthesis
    }
}

export default createChatAgent;