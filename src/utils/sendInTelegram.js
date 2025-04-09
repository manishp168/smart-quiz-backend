const sendMessage = async (text) => {
    const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            chat_id: process.env.CHAT_ID,
            text: text,
            parse_mode: "HTML"
        })
    });

    if (response.ok) {
        console.log("Message Sent")
    }else{
        // console.log(response)
    }
}

export { sendMessage }