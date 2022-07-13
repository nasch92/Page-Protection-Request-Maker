mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript');
mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css');

//Test
console.log("Loading Page Protection Request Maker...");

let nominatedPageName = mw.config.get('wgPageName')
let nominatedPageNameWithoutUnderscores = nominatedPageName.replaceAll('_', ' ')

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
				$("select[name='motive']").prop('disabled', e.target.value !== "protección")
			},
		list: getProtectionTypeOptions()
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
}

function submitMessage(e) {
	let form = e.target;
	let input = Morebits.quickForm.getInputData(form);
	if (input.reason === ``) {
		alert("No se ha establecido un motivo.");
	} else {
		if (window.confirm(`¿Quieres solicitar la ${input.protection} del artículo ${nominatedPageNameWithoutUnderscores}?`)) {
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