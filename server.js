const express = require("express");
const Mastodon = require("mastodon-api");

const Formatter = require("./funcs/Formatter");
const Dice = require("./funcs/Dice");
const Janken = require("./funcs/Janken");



let mstdn = new Mastodon({
	api_url: "https://botdon.net/api/v1/",
	access_token: "824d27faa1d45b4ddbbaa0c27fe6dcc818603b350bfefa13536538e1a3dae22d"
});

let stream = mstdn.stream("streaming/user");
	stream.on("message", toot => {
		let tootInfo = Formatter.getInfoFromToot(toot);
		
		//console.log(toot.data);
		console.log(`${tootInfo.tooter} … ${tootInfo.tootContent}`);
		
		if (tootInfo.tootContent.toUpperCase().match(/@VAWN/g)) {
			let variables = [];
			
			switch (true) {
				default:
					mstdn.post("statuses", {
						status: [
							`@${tootInfo.tooter}からVAWNへのメンションを確認しました。`,
							"コマンドを正しく認識できなかったため処理が行えませんでした。申し訳ありません。",
							"",
							"現在VAWNが対応しているコマンドについては、以下を参照してください。",
							"https://vawn.glitch.me/"
						].join("\r\n"),
						
						visibility: "public",
						in_reply_to_id: tootInfo.tootId
					});

					break;

				case !!(variables = Formatter.htmlTextToPlainText(tootInfo.tootContent).match(/(?:あなた|きみ|君|おまえ|お前|VAWN(?:| ))の(?:親|父親)/)):
					mstdn.post("statuses", {
						status: [
							`@${tootInfo.tooter}`,
							"私を作ってくれたのは私を使ってくださったみなさんです！"
						].join("\r\n"),

						visibility: "public",
						in_reply_to_id: tootInfo.tootId
					});

					break;

				case !!(variables = tootInfo.tootContent.match(/サイコロ|さいころ|ダイス/)):
					mstdn.post("statuses", {
						status: [
							`@${tootInfo.tooter}`,
							`${Math.floor(Math.random() * 5 + 1)}が出ました。`
						].join("\r\n"),

						visibility: "public",
						in_reply_to_id: tootInfo.tootId
					});
					break;


				case !!(variables = tootInfo.tootContent.match(/(?:じゃんけん|ジャンケン)(グー|グ〜|ぐー|ぐ～|チョキ|ちょき|パー|パ〜|ぱー|ぱ～)/)):
					let playerAct = variables[1] || "グー";

					let vawnActId = Math.floor(Math.random() * 2);
					let vawnAct = Janken.ACTIONS[vawnActId];

					let state = Janken.getState(Janken.detectAction(playerAct), vawnActId);
					
					mstdn.post("statuses", {
						status: [
							`@${tootInfo.tooter}`,
							"",
							`${vawnAct}！`,
							`あなたは${playerAct}を出したので、`,
							`${state}です！！`
						].join("\r\n"),

						visibility: "public",
						in_reply_to_id: tootInfo.tootId
					});

					break;
			}
		}
	});
	
let app = express();
	app.use(express.static('views'));
	
	app.get("/", (req, res) => {
		res.sendFile(`${__dirname}/views/`);
	});
	
let listener = app.listen(process.env.PORT, function () {
	console.log(`[VAWN] I'm running on port ${listener.address().port}!!`);
	mstdn.post("statuses", {
		status: [
			"VAWNの起動が完了しました。コマンドの処理が可能です。"
		].join("\r\n"),

		visibility: "public"
	})
});