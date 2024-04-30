import { isLoggedIn, ofRandom } from "../Util";

const createPostSubAgent = (end) => {

    const CS571_WITAI_ACCESS_TOKEN = "YKR3CC2JMLS4XV6PPIDS6ZCJ5PLMGQCI";

    let stage;
    let title, content, chatroom, confirm;

    const handleInitialize = async (promptData) => {
        if (await isLoggedIn()) {
            const hasSpecifiedChatroom = promptData.entities["get_messages:get_messages"] ? true : false;
            
            if (hasSpecifiedChatroom) {
                chatroom = promptData.entities["get_messages:get_messages"][0].value;
                stage = "FOLLOWUP_TITLE";
                return ofRandom([
                    "Great! What would you like your title to be?",
                    "Thanks, and what is on your mind today for the title?"
                ])
            } else {
                return end("Please specify a chatroom to post to!")
            }
        } else {
            return end("You need to be logged in to post!");
        }
    }

    const handleReceive = async (prompt) => {
        switch (stage) {
            case "FOLLOWUP_TITLE": return await handleFollowupTitle(prompt);
            case "FOLLOWUP_CONTENT": return await handleFollowupContent(prompt);
            case "FOLLOWUP_CONFIRM": return await handleFollowupConfirm(prompt);
        }
    }

    const handleFollowupTitle = async (prompt) => {
        title = prompt;
        stage = "FOLLOWUP_CONTENT"
        return ofRandom([
            "Great! What would you like to say?",
            "Thanks, and what more would you like to say?"
        ])
    }

    const handleFollowupContent = async (prompt) => {
        content = prompt;
        stage = "FOLLOWUP_CONFIRM"
        return `Sweet! To confirm, would you like to create a post titled '${title}' in ${chatroom}?`
    }

    const handleFollowupConfirm = async (prompt) => {
        confirm = prompt;
        const resp = await fetch(`https://api.wit.ai/message?q=${encodeURIComponent(prompt)}`, {
            headers: {
                "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
            }
        })
        const data = await resp.json();
        if (data.intents.length > 0 && data.intents[0].name === 'wit$confirmation') {
            await fetch(`https://cs571.org/api/s24/hw11/messages?chatroom=${chatroom}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CS571-ID": CS571.getBadgerId(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    content: content
                })
            })
            return end({
                msg: ofRandom([
                    "Your post has been posted!",
                    "Congrats, your post has been posted!"
                ]),
                emote: 'bucki_success.png'
            });
        } else {
            return end(ofRandom([
                "No worries, if you want to create a post in the future, just ask!",
                "That's alright, if you want to create a post in the future, just ask!"
            ]))
        }
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createPostSubAgent;