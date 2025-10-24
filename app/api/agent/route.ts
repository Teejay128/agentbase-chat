import { NextRequest, NextResponse } from "next/server";
import { getAgentbaseClient } from "@/lib/agentClient";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { message, session, mode, system, rules } = body;

		if (!message) {
			return NextResponse.json(
				{ error: "Message is required" },
				{ status: 400 }
			);
		}

		const agentbase = getAgentbaseClient();

		const params = {
			message,
			...(session && { session }),
			...(mode && { mode }),
			...(system && { system }),
			...(rules && { rules }),
		};

		const agentStream = await agentbase.runAgent(params);
		// const agentStream = [
		// 	{ session: "u0xlccxtq3fduud", type: "agent_started" },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_use",
		// 		content:
		// 			'{"tool":"web","input":"{\\"command\\":\\"search\\",\\"query\\":\\"\\\\\\"Hans Niemann\\\\\\" \\\\\\"Abhimanyu Mishra\\\\\\" St Louis 2025 streak ended\\"}"}',
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_response",
		// 		content:
		// 			"{\n" +
		// 			'  "tool": "web",\n' +
		// 			'  "response": [\n' +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news/view/2025-us-championship-round-5",\n' +
		// 			'      "title": "Niemann, Caruana Catch So; Christmas Comes Early For ...",\n' +
		// 			'      "publishedDate": "2025-10-18T09:44:33.090Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news",\n' +
		// 			'      "title": "Chess News and Event Coverage"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/fischerov/",\n' +
		// 			'      "title": "Fischerov Chess Page | Manila"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/100063766620989/photos/1369635531838655/",\n' +
		// 			'      "title": "Saint Louis Chess Club added a...",\n' +
		// 			'      "publishedDate": "2025-10-18T00:44:33.090Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.reddit.com/r/chess/comments/1o9fhz5/hans_niemann_breaks_the_unbeaten_streak_of/",\n' +
		// 			'      "title": "Hans Niemann breaks the unbeaten streak of Abhimanyu ...",\n' +
		// 			'      "publishedDate": "2025-10-17T22:44:33.090Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.instagram.com/p/DP7XANZjaaq/",\n' +
		// 			'      "title": "Hans Niemann Defeats Abhimanyu Mishra in US Chess ...",\n' +
		// 			'      "publishedDate": "2025-10-17T22:44:33.090Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.instagram.com/stlchessclub/p/DP2FHlejS1C/",\n' +
		// 			`      "title": "Abhimanyu Mishra's Unstoppable Streak in Classical Chess",\n` +
		// 			'      "publishedDate": "2025-10-16T10:44:33.090Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.reddit.com/r/chess/",\n' +
		// 			'      "title": "r/Chess"\n' +
		// 			"    }\n" +
		// 			"  ]\n" +
		// 			"}",
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_step", stepNumber: 1 },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_cost",
		// 		cost: "0.0443",
		// 		balance: 75.00439999999999,
		// 		deductionSuccess: true,
		// 		lowBalance: false,
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_response",
		// 		content: "Perfect! Let me get the details of this story:",
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_use",
		// 		content:
		// 			'{"tool":"web","input":"{\\"command\\":\\"crawl\\",\\"urls\\":[\\"https://www.reddit.com/r/chess/comments/1o9fhz5/hans_niemann_breaks_the_unbeaten_streak_of/\\"]}"}',
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_response",
		// 		content: '{\n  "tool": "web",\n  "response": []\n}',
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_step", stepNumber: 2 },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_cost",
		// 		cost: "0.0461",
		// 		balance: 74.9583,
		// 		deductionSuccess: true,
		// 		lowBalance: false,
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_use",
		// 		content:
		// 			'{"tool":"web","input":"{\\"command\\":\\"search\\",\\"query\\":\\"\\\\\\"Hans Niemann\\\\\\" ends Abhimanyu Mishra unbeaten streak US Championship 2025\\"}"}',
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_response",
		// 		content:
		// 			"{\n" +
		// 			'  "tool": "web",\n' +
		// 			'  "response": [\n' +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news/view/2025-us-championship-round-5",\n' +
		// 			'      "title": "Niemann, Caruana Catch So; Christmas Comes Early For ...",\n' +
		// 			'      "publishedDate": "2025-10-18T09:44:35.566Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/fischerov/videos/hans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i/1326814428990551/",\n' +
		// 			'      "title": "Hans Niemann checkmates Abhimanyu Mishra in Round 5 ...",\n' +
		// 			'      "publishedDate": "2025-10-18T03:44:35.566Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.instagram.com/p/DP7XANZjaaq/",\n' +
		// 			'      "title": "Hans Niemann Defeats Abhimanyu Mishra in US Chess ...",\n' +
		// 			'      "publishedDate": "2025-10-17T22:44:35.566Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.youtube.com/watch?v=AoQsjPQUSII",\n' +
		// 			'      "title": "Streak-Breaker Hans: Someone has to be the Villain. | R5 ...",\n' +
		// 			'      "publishedDate": "2025-10-17T23:44:35.566Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.reddit.com/r/chess/",\n' +
		// 			'      "title": "r/Chess"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.reddit.com/r/chess/comments/1o9fhz5/hans_niemann_breaks_the_unbeaten_streak_of/",\n' +
		// 			'      "title": "Hans Niemann breaks the unbeaten streak of Abhimanyu ...",\n' +
		// 			'      "publishedDate": "2025-10-17T22:44:35.566Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news/view/2025-us-championship-round-4",\n' +
		// 			'      "title": "Niemann Joins Battle For U.S. Title; Sargsyan Extends Lead",\n' +
		// 			'      "publishedDate": "2025-10-16T10:44:35.566Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.instagram.com/stlchessclub/p/DP2FHlejS1C/",\n' +
		// 			`      "title": "Abhimanyu Mishra's Unstoppable Streak in Classical Chess",\n` +
		// 			'      "publishedDate": "2025-10-16T10:44:35.566Z"\n' +
		// 			"    }\n" +
		// 			"  ]\n" +
		// 			"}",
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_step", stepNumber: 3 },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_cost",
		// 		cost: "0.0455",
		// 		balance: 74.91279999999999,
		// 		deductionSuccess: true,
		// 		lowBalance: false,
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_use",
		// 		content:
		// 			'{"tool":"web","input":"{\\"command\\":\\"crawl\\",\\"urls\\":[\\"https://www.chess.com/news/view/2025-us-championship-round-5\\",\\"https://www.facebook.com/fischerov/videos/hans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i/1326814428990551/\\"]}"}',
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_response",
		// 		content:
		// 			"{\n" +
		// 			'  "tool": "web",\n' +
		// 			'  "response": [\n' +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/fischerov/videos/hans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i/1326814428990551/",\n' +
		// 			'      "content": "# [_Facebook_](https://www.facebook.com/)\\n\\n| | |\\n| --- | --- |\\n| Email or phone | Password |\\n| [Forgot account?](https://www.facebook.com/recover/initiate?lwv=100&ars=royal_blue_bar) |\\n\\n[Create new account](https://www.facebook.com/r.php?locale=en_US)\\n\\n## You’re Temporarily Blocked\\n\\n## You’re Temporarily Blocked\\n\\nIt looks like you were misusing this feature by going too fast. You’ve been temporarily blocked from using it.\\n\\n[Back](https://www.facebook.com/www.facebook.com)\\n\\n- English (US)\\n- [Español](https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Ffischerov%2Fvideos%2Fhans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i%2F1326814428990551%2F)\\n- [Français (France)](https://es-la.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Ffischerov%2Fvideos%2Fhans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i%2F1326814428990551%2F)\\n- [中文(简体)](https://fr-fr.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Ffischerov%2Fvideos%2Fhans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i%2F1326814428990551%2F)\\n- [العربية](https://zh-cn.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Ffischerov%2Fvideos%2Fhans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i%2F1326814428990551%2F)\\n- [Português (Brasil)](https://ar-ar.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Ffischerov%2Fvideos%2Fhans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i%2F1326814428990551%2F)\\n- [Italiano](https://pt-br.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Ffischerov%2Fvideos%2Fhans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i%2F1326814428990551%2F)\\n- [한국어](https://it-it.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Ffischerov%2Fvideos%2Fhans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i%2F1326814428990551%2F)\\n- [Deutsch](https://ko-kr.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Ffischerov%2Fvideos%2Fhans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i%2F1326814428990551%2F)\\n- [हिन्दी](https://de-de.faceboook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Ffischerov%2Fvideos%2Fhans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i%2F1326814428990551%2F)\\n- [日本語](https://hi-in.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Ffischerov%2Fvideos%2Fhans-niemann-checkmates-abhimanyu-mishra-in-round-5-bringing-an-end-to-mishras-i%2F1326814428990551%2F)\\n\\n- [Sign Up](https://www.facebook.com/reg/)\\n- [Log In](https://www.facebook.com/login/)\\n- [Messenger](https://messenger.com/)\\n- [Facebook Lite](https://www.facebook.com/lite/)\\n- [Video](https://www.facebook.com/watch/)\\n- [Meta Pay](https://about.meta.com/technologies/meta-pay)\\n- [Meta Store](https://www.meta.com/)\\n- [Meta Quest](https://www.meta.com/quest/)\\n- [Ray-Ban Meta](https://www.meta.com/smart-glasses/)\\n- [Meta AI](https://www.meta.ai/)\\n- [Meta AI more content](https://www.meta.ai/pages/electric-scooters-sustainable-transportation-thrilling-ride/?utm_source=foa_web_footer)\\n- [Instagram](https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2F&h=AT0BR-exIwdiy9v5WVkgvWLfBo2FSogrdFR4kvaz3zIoEdVbTlqe39Kn1trmZ45eAaHYDllDc32s57dpgb1Hp6U_LRU7qyfecpl2Gxe3myIMuQLuGeBo1K4zmOl6RMzRDNtoPTFsLNo1bO78lHxDGFOxB1ibQsNmxYR3-jfJK9c)\\n- [Threads](https://www.threads.com/)\\n- [Voting Information Center](https://www.facebook.com/votinginformationcenter/?entry_point=c2l0ZQ%3D%3D)\\n- [Privacy Policy](https://www.facebook.com/privacy/policy/?entry_point=facebook_page_footer)\\n- [Consumer Health Privacy](https://www.facebook.com/privacy/policies/health/?entry_point=facebook_page_footer)\\n- [Privacy Center](https://www.facebook.com/privacy/center/?entry_point=facebook_page_footer)\\n- [About](https://about.meta.com/)\\n- [Create ad](https://www.facebook.com/ad_campaign/landing.php?placement=pflo&campaign_id=402047449186&nav_source=unknown&extra_1=auto)\\n- [Create Page](https://www.facebook.com/pages/create/?ref_type=site_footer)\\n- [Developers](https://developers.facebook.com/?ref=pf)\\n- [Careers](https://www.facebook.com/careers/?ref=pf)\\n- [Cookies](https://www.facebook.com/policies/cookies/)\\n- [Ad choices](https://www.facebook.com/help/568137493302217)\\n- [Terms](https://www.facebook.com/policies?ref=pf)\\n- [Help](https://www.facebook.com/help/?ref=pf)\\n- [Contact Uploading & Non-Users](https://www.facebook.com/help/637205020878504)\\n- [Settings](https://www.facebook.com/settings)\\n- [Activity log](https://www.facebook.com/allactivity?privacy_source=activity_log_top_menu)\\n\\nMeta © 2025"\n' +
		// 			"    }\n" +
		// 			"  ]\n" +
		// 			"}",
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_step", stepNumber: 4 },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_cost",
		// 		cost: "0.0482",
		// 		balance: 74.8646,
		// 		deductionSuccess: true,
		// 		lowBalance: false,
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_use",
		// 		content:
		// 			'{"tool":"web","input":"{\\"command\\":\\"search\\",\\"query\\":\\"\\\\\\"Hans Niemann\\\\\\" ends Abhimanyu Mishra streak US Chess Championship 2025 details\\"}"}',
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_response",
		// 		content:
		// 			"{\n" +
		// 			'  "tool": "web",\n' +
		// 			'  "response": [\n' +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news",\n' +
		// 			'      "title": "Chess News and Event Coverage"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/photo.php?fbid=1109259911000408&id=100057492277650&set=a.708140327779037",\n' +
		// 			'      "title": "Chess principles you should know!!",\n' +
		// 			'      "publishedDate": "2025-03-18T10:44:40.305Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/STLChessClub/",\n' +
		// 			'      "title": "Saint Louis Chess Club | St. Louis MO"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.instagram.com/p/DP4A1UkEQOu/",\n' +
		// 			'      "title": "US Chess | Ratings shown are the official US ...",\n' +
		// 			'      "publishedDate": "2025-10-17T10:44:40.305Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.reddit.com/r/chess/",\n' +
		// 			'      "title": "r/Chess"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.reddit.com/r/chess/comments/1o9gb2d/hans_niemann_prepares_to_grab_bishop_and_knight/",\n' +
		// 			'      "title": "Hans Niemann prepares to grab bishop and knight ...",\n' +
		// 			'      "publishedDate": "2025-10-17T23:44:40.305Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.41nbc.com/community-prepares-students-return/?s-news-794036-2025-10-14-woodward-defeats-fabi-round-2-us-chess-championships-2025",\n' +
		// 			'      "title": "Woodward Defeats Fabi in Round 2 of US Chess ...",\n' +
		// 			'      "publishedDate": "2025-10-14T10:44:40.305Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news/view/2025-fide-grand-swiss-round-10",\n' +
		// 			'      "title": "FIDE Grand Swiss Round 10: Niemann Beats Pragg To ...",\n' +
		// 			'      "publishedDate": "2025-09-15T00:00:00.000Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/events/2023-us-chess-championship/04/Mishra_Abhimanyu-Niemann_Hans_Moke",\n' +
		// 			'      "title": "Mishra Abhimanyu vs Niemann Hans Moke - U.S. Championship 2023",\n' +
		// 			'      "publishedDate": "2025-01-01T00:00:00.000Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/STLChessClub/videos/2025-us-chess-championships-round-2/1493248475055621/",\n' +
		// 			`      "title": "America's top chess players compete in the most prestigious ...",\n` +
		// 			'      "publishedDate": "2025-10-14T10:44:40.305Z"\n' +
		// 			"    }\n" +
		// 			"  ]\n" +
		// 			"}",
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_step", stepNumber: 5 },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_cost",
		// 		cost: "0.0551",
		// 		balance: 74.8095,
		// 		deductionSuccess: true,
		// 		lowBalance: false,
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_response",
		// 		content: "Let me check the chess.com coverage:",
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_use",
		// 		content:
		// 			'{"tool":"web","input":"{\\"command\\":\\"crawl\\",\\"urls\\":[\\"https://www.chess.com/news/view/2025-us-championship-round-5\\"]}"}',
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_response",
		// 		content: '{\n  "tool": "web",\n  "response": []\n}',
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_step", stepNumber: 6 },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_cost",
		// 		cost: "0.0537",
		// 		balance: 74.7558,
		// 		deductionSuccess: true,
		// 		lowBalance: false,
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_use",
		// 		content:
		// 			'{"tool":"web","input":"{\\"command\\":\\"search\\",\\"query\\":\\"Hans Niemann Abhimanyu Mishra US Championship 2025 Round 5 checkmates ends streak\\"}"}',
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_response",
		// 		content:
		// 			"{\n" +
		// 			'  "tool": "web",\n' +
		// 			'  "response": [\n' +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news/view/2025-us-championship-round-5",\n' +
		// 			'      "title": "Niemann, Caruana Catch So; Christmas Comes Early For Carissa Yip",\n' +
		// 			'      "publishedDate": "2025-10-18T09:44:42.196Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.reddit.com/r/chess/comments/1o9fho4/hans_moke_niemann_wins_a_studylike_endgame_to/",\n' +
		// 			'      "title": "r/chess on Reddit: Hans Moke Niemann wins a study-like endgame ...",\n' +
		// 			'      "publishedDate": "2025-10-17T22:44:42.196Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.instagram.com/p/DP7XANZjaaq/",\n' +
		// 			'      "title": "Hans Niemann Defeats Abhimanyu Mishra in US Chess ... - Instagram",\n' +
		// 			'      "publishedDate": "2025-10-17T22:44:42.196Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.reddit.com/r/chess/rising/",\n' +
		// 			'      "title": "r/Chess - Reddit"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.youtube.com/watch?v=OEXk5E3mhEE",\n' +
		// 			'      "title": "CHECKMATE!! Hans Niemann (2738) vs Abhimanyu Mishra (2652)",\n' +
		// 			'      "publishedDate": "2025-10-17T23:44:42.196Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.youtube.com/watch?v=AoQsjPQUSII",\n' +
		// 			'      "title": "Streak-Breaker Hans: Someone has to be the Villain. - YouTube",\n' +
		// 			'      "publishedDate": "2025-10-17T23:44:42.196Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/groups/1452276709525526/posts/1545383490214847/",\n' +
		// 			'      "title": "Chess player extends unbeaten streak to 71 games - Facebook",\n' +
		// 			'      "publishedDate": "2025-10-16T10:44:42.196Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.youtube.com/watch?v=mvr53fCv-es",\n' +
		// 			'      "title": "2025 U.S. Chess Championships: Round 5 | Wesley So vs. Levon ...",\n' +
		// 			'      "publishedDate": "2025-10-17T23:44:42.196Z"\n' +
		// 			"    }\n" +
		// 			"  ]\n" +
		// 			"}",
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_step", stepNumber: 7 },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_cost",
		// 		cost: "0.0527",
		// 		balance: 74.70309999999999,
		// 		deductionSuccess: true,
		// 		lowBalance: false,
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_response",
		// 		content:
		// 			"Perfect! Now I can see the story. Let me get the full details:",
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_use",
		// 		content:
		// 			'{"tool":"web","input":"{\\"command\\":\\"search\\",\\"query\\":\\"\\\\\\"Hans Niemann\\\\\\" checkmates \\\\\\"Abhimanyu Mishra\\\\\\" end of winning streak US Championship 2025\\"}"}',
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_response",
		// 		content:
		// 			"{\n" +
		// 			'  "tool": "web",\n' +
		// 			'  "response": [\n' +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news/view/2025-us-championship-round-5",\n' +
		// 			'      "title": "Niemann, Caruana Catch So; Christmas Comes Early For ...",\n' +
		// 			'      "publishedDate": "2025-10-18T09:44:43.734Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.reddit.com/r/chess/comments/1o9fhz5/hans_niemann_breaks_the_unbeaten_streak_of/",\n' +
		// 			'      "title": "Hans Niemann breaks the unbeaten streak of Abhimanyu ...",\n' +
		// 			'      "publishedDate": "2025-10-17T22:44:43.734Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/fischerov/",\n' +
		// 			'      "title": "Fischerov Chess Page | Manila"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/photo.php?fbid=1607566250539109&id=100038572492090&set=a.372713264024420",\n' +
		// 			'      "title": "Fischerov - White to move. Mate in 2. #chess #chesspuzzle ...",\n' +
		// 			'      "publishedDate": "2025-09-18T10:44:43.734Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.youtube.com/watch?v=6N9WOZzjXes",\n' +
		// 			'      "title": "🇺🇸 Hans Moke Niemann vs Abhimanyu Mishra 🇺🇸| FIDE Grand Sw   wiss 2025 | Round 9 | Board 5",\n' +
		// 			'      "publishedDate": "2025-09-13T00:00:00.000Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/events/2023-us-chess-championship/04/Mishra_Abhimanyu-Niemann_Hans_Moke",\n' +
		// 			'      "title": "Mishra Abhimanyu vs Niemann Hans Moke - U.S. Championship 2023",\n' +
		// 			'      "publishedDate": "2025-01-01T00:00:00.000Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/events/2025-fide-grand-swiss-open/09/Niemann_Hans_Moke-Mishra_Abhimanyu",\n' +
		// 			'      "title": "Niemann Hans Moke vs Mishra Abhimanyu - Open",\n' +
		// 			'      "publishedDate": "2025-01-01T00:00:00.000Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.chessfocus.com/tournament-history/abhimanyu-mishra",\n' +
		// 			'      "title": "Abhimanyu Mishra chess tournament record",\n' +
		// 			'      "publishedDate": "2025-01-01T00:00:00.000Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.youtube.com/watch?v=7lP2oVNVuBs",\n' +
		// 			`      "title": "World's youngest GM Abhimanyu Mishra takes down World Champion Gukesh | Grand Swiss 2025",\n` +
		// 			'      "publishedDate": "2025-09-08T00:00:00.000Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news/view/2025-us-championship-round-3",\n' +
		// 			'      "title": "Wesley So Takes Sole US Championship Lead",\n' +
		// 			'      "publishedDate": "2025-10-15T10:44:43.734Z"\n' +
		// 			"    }\n" +
		// 			"  ]\n" +
		// 			"}",
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_step", stepNumber: 8 },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_cost",
		// 		cost: "0.0556",
		// 		balance: 74.6475,
		// 		deductionSuccess: true,
		// 		lowBalance: false,
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_use",
		// 		content:
		// 			'{"tool":"web","input":"{\\"command\\":\\"crawl\\",\\"urls\\":[\\"https://www.reddit.com/r/chess/comments/1o9fhz5/hans_niemann_breaks_the_unbeaten_streak_of/\\"]}"}',
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_response",
		// 		content: '{\n  "tool": "web",\n  "response": []\n}',
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_step", stepNumber: 9 },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_cost",
		// 		cost: "0.0576",
		// 		balance: 74.5899,
		// 		deductionSuccess: true,
		// 		lowBalance: false,
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_response",
		// 		content:
		// 			"Let me search for more details about this streak-breaking game:",
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_use",
		// 		content:
		// 			'{"tool":"web","input":"{\\"command\\":\\"search\\",\\"query\\":\\"\\\\\\"Abhimanyu Mishra\\\\\\" unbeaten streak ended by Hans Niemann US Chess Championship 2025 Round 5\\"}"}',
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_tool_response",
		// 		content:
		// 			"{\n" +
		// 			'  "tool": "web",\n' +
		// 			'  "response": [\n' +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news/view/2025-us-championship-round-5",\n' +
		// 			'      "title": "Niemann, Caruana Catch So; Christmas Comes Early For ...",\n' +
		// 			'      "publishedDate": "2025-10-18T09:44:46.301Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.reddit.com/r/chess/comments/1o9fhz5/hans_niemann_breaks_the_unbeaten_streak_of/",\n' +
		// 			'      "title": "Hans Niemann breaks the unbeaten streak of Abhimanyu ...",\n' +
		// 			'      "publishedDate": "2025-10-17T22:44:46.301Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.instagram.com/p/DP7XANZjaaq/",\n' +
		// 			'      "title": "Hans Niemann Defeats Abhimanyu Mishra in US Chess ...",\n' +
		// 			'      "publishedDate": "2025-10-17T22:44:46.301Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news",\n' +
		// 			'      "title": "Chess News and Event Coverage"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.reddit.com/r/chess/new/",\n' +
		// 			'      "title": "r/Chess"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/STLChessClub/posts/hans-niemann-claimed-his-first-victory-of-the-us-chess-championship-by-defeating/1367722175363324/",\n' +
		// 			'      "title": "Hans Niemann claimed his first victory of the US Chess ...",\n' +
		// 			'      "publishedDate": "2025-10-16T10:44:46.301Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.instagram.com/stlchessclub/p/DP2FHlejS1C/",\n' +
		// 			`      "title": "Abhimanyu Mishra's Unstoppable Streak in Classical Chess",\n` +
		// 			'      "publishedDate": "2025-10-16T10:44:46.301Z"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.facebook.com/groups/1452276709525526/posts/1545383490214847/",\n' +
		// 			'      "title": "Chess player extends unbeaten streak to 71 games"\n' +
		// 			"    },\n" +
		// 			"    {\n" +
		// 			'      "url": "https://www.chess.com/news/view/2025-fide-grand-swiss-round-5",\n' +
		// 			'      "title": "FIDE Grand Swiss Round 5: Mishra Youngest Player Ever ...",\n' +
		// 			'      "publishedDate": "2025-09-09T00:00:00.000Z"\n' +
		// 			"    }\n" +
		// 			"  ]\n" +
		// 			"}",
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_step", stepNumber: 10 },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_cost",
		// 		cost: "0.0561",
		// 		balance: 74.5338,
		// 		deductionSuccess: true,
		// 		lowBalance: false,
		// 	},
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_response",
		// 		content:
		// 			"Yes! You were absolutely right. Here's the story about Hans Niemann ending Abhimanyu Mishra's streak at the 2025 U.S. Chess Championship:\n" +
		// 			"\n" +
		// 			"## **Hans Niemann Breaks Abhimanyu Mishra's Unbeaten Streak**\n" +
		// 			"\n" +
		// 			"**The Story:**\n" +
		// 			"In Round 5 of the 2025 U.S. Chess Championship (October 2025), Hans Niemann delivered a dramatic checkmate to Abhimanyu Mishra, ending Mishra's impressive unbeaten streak in classical chess.\n" +
		// 			"\n" +
		// 			"**Key Details:**\n" +
		// 			"- **The Match**: Hans Niemann vs. Abhimanyu Mishra in Round 5 of the U.S. Championship\n" +
		// 			"- **The Result**: Niemann won with a checkmate, breaking Mishra's streak\n" +
		// 			"- **The Stakes**: This was Mishra's first loss after an extended unbeaten run in classical chess games\n" +
		// 			'- **The Drama**: The game was described as having "study-like endgame" qualities, suggesting it was a complex and memorable battle\n' +
		// 			"\n" +
		// 			"**The Context:**\n" +
		// 			"This was particularly significant because:\n" +
		// 			"- Abhimanyu Mishra had been on an impressive unbeaten streak in classical chess\n" +
		// 			"- Hans Niemann was looking for his first victory of the tournament\n" +
		// 			"- The match drew considerable attention in the chess community, with social media posts highlighting the end of Mishra's streak\n" +
		// 			"\n" +
		// 			"The game was notable enough to generate multiple Reddit discussions and social media posts, with chess fans discussing the tactical elements of how Niemann managed to break through Mishra's defenses and end his unbeaten run.\n" +
		// 			"\n" +
		// 			"This adds another chapter to the ongoing drama surrounding Hans Niemann, showing he's still capable of delivering strong performances against top American talent.",
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_step", stepNumber: 11 },
		// 	{
		// 		session: "u0xlccxtq3fduud",
		// 		type: "agent_cost",
		// 		cost: "0.0630",
		// 		balance: 74.4708,
		// 		deductionSuccess: true,
		// 		lowBalance: false,
		// 	},
		// 	{ session: "u0xlccxtq3fduud", type: "agent_completed" },
		// ];

		const DELIMITER = "<<<END_OF_CHUNK>>>";
		const fullChunk: unknown[] = [];

		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				try {
					for await (const chunk of agentStream) {
						const jsonChunk =
							typeof chunk === "string"
								? JSON.stringify({ message: chunk })
								: JSON.stringify(chunk);

						fullChunk.push(jsonChunk);
						controller.enqueue(
							encoder.encode(jsonChunk + DELIMITER)
						);
						await new Promise((r) => setTimeout(r, 1000));
					}

					controller.close();
				} catch (err) {
					controller.error(err);
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
