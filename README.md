# Hide & Seek

We develop Hide-n-Seek, an intent-aware privacy protection plugin for personalized web search. In addition to users’ genuine search
queries, Hide-n-Seek submits k cover queries and corresponding clicks to an external search engine to disguise a user’s search intent
grounded and reinforced in a search session by mimicking the true query sequence. The cover queries are synthesized and randomly
sampled from a topic hierarchy, where each node represents a coherent search topic estimated by both n-gram and neural language
models constructed over crawled web documents. Hide-n-Seek also personalizes the returned search results by re-ranking them based
on the genuine user profile developed and maintained on the client side. With a variety of graphical user interfaces, we present the
topic-based query obfuscation mechanism to the end users for them to digest how their search privacy is protected. The idea is documented in SIGIR '18 full paper [Intent-aware Query Obfuscation for Privacy Protection in Personalized Web Search](http://delivery.acm.org/10.1145/3210000/3209983/p285-ahmad.pdf). Hide-and-Seek also has its own demo paper at SIGIR '18 [Hide-n-Seek: An Intent-aware Privacy Protection Plugin for PersonalizedWeb Search](http://delivery.acm.org/10.1145/3220000/3210180/p1333-yu.pdf).

## How to run Hide & Seek?

Hide & Seek has **not** yet been published to chrome web store. Feel free to manually install the extension following such steps.

1. Download or fork project to your local environment. Click the green button `Clone or Download` in top-right corner of this page.
2. Open Chrome and go to `chrome://extensions`.
3. Click "load unpacked extension...".
4. Select the downloaded project folder.

and... You are good to go!

## Configurations

Hide & Seek needs another tomcat servlet to fulfill all its fuctionalities. Our server at UVa is able yet available for public access, therefore if you are interest to run the system, you could download the servlet from [another Github repo of mine](https://github.com/PxYu/QueryGenerator). See [this guide](https://github.com/PxYu/Hide-Seek/wiki/Deployment) for detailed guides of deployment.
