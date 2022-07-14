mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript');
mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css');

//Test
console.log("Loading Page Protection Request Maker...");

let pageName = mw.config.get('wgPageName')
let pageNameWithoutUnderscores = pageName.replaceAll('_', ' ')

let listProtectionOptions = [
	{ code: "protección", name: "Solicitar protección", default: true },
	{ code: "desprotección", name: "Solicitar desprotección" }
]

function getProtectionTypeOptions() {
	let dropDownOptions = [];
	for (let chosenType of listProtectionOptions) {
		let option = { type: 'option', value: chosenType.code, label: chosenType.name, checked: chosenType.default };
		dropDownOptions.push(option);
	}
	return dropDownOptions;
}

let listMotiveOptions = [
	{ name: "Vandalismo" },
	{ name: "SPAM" },
	{ name: "Información falsa o especulativa" },
	{ name: "Guerra de ediciones" },
	{ name: "Otro" }
]

function getMotiveOptions() {
	let dropDownOptions = [];
	for (let chosenType of listMotiveOptions) {
		let option = { type: 'option', label: chosenType.name, checked: chosenType.default };
		dropDownOptions.push(option);
	}
	return dropDownOptions
}

function protectionFromGetReply(data) {
	let pages = data.query.pages;
	for (p in pages) {
		protectionLevel = pages[p].protection[0]?.level
		switch (protectionLevel) {
			case 'sysop':
				return 'solo bibliotecarios';
			case 'autoconfirmed':
				return 'solo usuarios autoconfirmados';
			default:
				return 'sin protección';
		}
	}
}

function getProtectionStatus() {
	let params = {
		action: 'query',
		prop: 'info',
		inprop: 'protection',
		titles: pageName,
		format: 'json',
	}
	let apiPromise = new mw.Api().get(params);
	let protectionPromise = apiPromise.then(protectionFromGetReply);

	return protectionPromise;
}

function createStatusWindow() {
	let Window = new Morebits.simpleWindow(400, 350);
	Window.setTitle('Procesando acciones');
	var statusdiv = document.createElement('div');
	statusdiv.style.padding = '15px';  // just so it doesn't look broken
	Window.setContent(statusdiv);
	Morebits.status.init(statusdiv);
	Window.display();
}


function createFormWindow() {
	let Window = new Morebits.simpleWindow(620, 530);
	Window.setTitle('Solicitar protección de la página');
	Window.addFooterLink('Política de protección', 'Wikipedia:Política de protección');
	let form = new Morebits.quickForm(submitMessage);
	let radioField = form.append({
		type: 'field',
		label: 'Tipo:',
	});

	radioField.append({
		type: 'radio',
		name: 'protection',
		event:
			function (e) {
				nameToModify = document.querySelector("select[name='motive']")
				if (e.target.value !== "protección") {
					nameToModify.setAttribute('disabled', "")
				} else {
					nameToModify.removeAttribute('disabled', "")
				}
			},
		list: getProtectionTypeOptions()
	})

	form.append({
		type: 'div',
		name: 'currentProtection',
		label: `Nivel actual de protección: `
	})

	let textAreaAndReasonField = form.append({
		type: 'field',
		label: 'Opciones:',
	});

	textAreaAndReasonField.append({
		type: 'select',
		name: 'motive',
		label: 'Selecciona el motivo:',
		list: getMotiveOptions(),
		disabled: false
	});

	textAreaAndReasonField.append({
		type: 'textarea',
		name: 'reason',
		label: 'Desarrolla la razón:',
		tooltip: 'Puedes usar wikicódigo en tu descripción, tu firma se añadirá automáticamente.'
	});
	form.append({
		type: 'submit',
		label: 'Aceptar'
	});

	let result = form.render();
	Window.setContent(result);
	Window.display();

	getProtectionStatus().then(function (protectionLevel) {
		document.querySelector("div[name='currentProtection'] > span.quickformDescription")
			.innerHTML = `Nivel actual de protección:<span style="color:royalblue; font-weight: bold;"> ${protectionLevel} <span>`
	})
}

function submitMessage(e) {
	let form = e.target;
	let input = Morebits.quickForm.getInputData(form);
	if (input.reason === ``) {
		alert("No se ha establecido un motivo.");
	} else {
		if (window.confirm(`¿Quieres solicitar la ${input.protection} del artículo ${pageNameWithoutUnderscores}?`)) {
			console.log("Posting message on the noticeboard...")
			createStatusWindow()
			new Morebits.status("Paso 1", `Solicitando la ${input.protection} de la página...`, "info");
		}

	}
}

if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
	console.log("Special or non-existent page: PPRM will therefore not be loaded.");
} else {
	let portletLink = mw.util.addPortletLink('p-cactions', '#', 'Pedir protección', 'example-button', 'Solicita que esta página sea protegida');
	portletLink.onclick = createFormWindow;
}