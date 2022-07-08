mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript');
mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css');

//Test
console.log("Loading Page Protection Request Maker...");

function createFormWindow() {
    let Window = new Morebits.simpleWindow(620, 530);
}

if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
    console.log("Special or non-existent page: PPRM will therefore not be loaded.");
} else {
    let portletLink = mw.util.addPortletLink('p-cactions', '#', 'Pedir protección', 'example-button', 'Solicita que esta página sea protegida');
    portletLink.onclick = createFormWindow;
}