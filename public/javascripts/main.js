window.onload = function () {
    dragAndDrop();
    selectToUpload();
};
/* S:HOCs */
const elIdDom = elId => document.getElementById(elId);
const elSelDom = elSel => document.querySelector(elSel);
/* S:HOCs */

/* S:Drag And Drop Componeny  */
let dropArea = elIdDom('drop-area');

//event listeners manuplations 

function dragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].map(x => {
        dropArea.addEventListener(x, preventDefaults, false)
    });
    ['dragenter', 'dragover'].map(x => {
        dropArea.addEventListener(x, highlight, false)
    });

    ['dragleave', 'drop'].map(x => {
        dropArea.addEventListener(x, unhighlight, false)
    });

    dropArea.addEventListener('drop', handleDrop, false);
}

//for input select file upload
function selectToUpload() {
    elIdDom('img').addEventListener('change', function () {
        (this.value.length > 0) ?
        handleDrop(): false;
    });
}

// handling file drope after effects
function handleDrop(e) {
    let file = (e) ? e.dataTransfer.files : false;
    if (file) {
        elIdDom('img').files = file;
    }
    const {numbInBytes,fileName} = fileDetails();

    if (validateFileType() && validateFileSize(numbInBytes)) {
        elSelDom(".err-falied").classList.add("hidden");
        elSelDom('.file-name').innerHTML = fileName;
        previewFile();
        uploadFile(numbInBytes);
    }
}

//handling event bubbling and propagation
function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}


function highlight(e) {
    dropArea.classList.add('highlight')
}

function unhighlight(e) {
    dropArea.classList.remove('highlight')
}

/* E:Drag And Drop Componeny  */
/* S: front end file details  */
function fileDetails() {
    const file = elIdDom("img").files[0];
    const numbInBytes = file.size;
    const fileType = file.type;
    const fileName = file.name;
    return {
        numbInBytes,
        fileName,
        fileType
    }
}
/* E: front end file details  */
/* S:file validation size and type */
function validateFileType() {
    let {
        fileType
    } = fileDetails();
    fileType = fileType.split('/')[1];
    return (fileType == "jpg" || fileType == "jpeg" || fileType == "png") ?
        true :
        alert("Only jpg/jpeg and png files are allowed!");
}

function validateFileSize(numb) {
    numb /= (1024 * 1024)
    return (numb <= 5) ?
        true :
        alert("Please upload file with size less than 5MB");
}
/* E:file validation size and type */

/* S: convertinf file to base 64 for sendinf and preview */
function getFileInbase64() {
    return new Promise((resolve, reject) => {
        const file = elIdDom('img').files[0]
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = _ => resolve(reader.result);
        reader.onerror = err => console.error(err)
    })
}
/* E: convertinf file to base 64 for sendinf and preview */
/* S:File Preview  rendering file to user*/
async function previewFile() {
    let img = document.createElement('img')
    img.src = await getFileInbase64()
    el = elIdDom('gallery')
    el.innerHTML = '<h3><strong>Image Preview</strong></h3><br>';
    el.appendChild(img);
}
/* E:File Preview  rendering file to user*/

/* S:upload file make xhr call using fetch api */
async function uploadFile() {
    elSelDom("#svg-load").classList.remove("hidden");
    let data = new FormData();
    data.append('img', await getFileInbase64());
    try {
        var res = await fetch('/detect-objects', {method: 'POST',body: data});
        elSelDom("#svg-load").classList.add("hidden");
    } catch (err) {
         return hideNotification('err-falied');
    }
    const resJson = await res.json();
    handelResponse(resJson)
}
/* E:upload file make xhr call using fetch api */
/* S:handleing  xhr response */
function handelResponse(resJson){
    if (resJson.status == 'success') {
        appendResult(resJson.object);
        apenAdditionalData(resJson.resolution);
    } else {
        hideNotification('err-falied');
    }
}
/* E:handleing  xhr response */
/* S:rendering response */
function appendResult(object) {

    if(!object){
        return hideNotification('no-resultFound')
    }

    let html = `
                <h3><strong>Detection Result</strong></h3>
                <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
                    <tr>
                        <th>object</th>
                        <th>Probability</th>
                    </tr>
                `

    object.map(x => {
        html += ` <tr>
                    <td>${x.class}</td>
                    <td>${x.score.toFixed(3)}</td>
                </tr>`
    });

    html += '</table>';

    const el = elIdDom('append-result');

    el.innerHTML = html;

    // SCROLLING TO BOTTOM OF THE PAGE
    window.scrollTo(0,document.body.scrollHeight);

}

function apenAdditionalData(resolution) {
    const {
        fileType,
        numbInBytes
    } = fileDetails();

    let html = `
                <h3><strong>File Details</strong></h3>
                <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
                    <tr>
                        <td>Image Resolution</td>
                        <td>${resolution}</td>
                    </tr>
                    <tr>
                        <td>File Type</td>
                        <td>${fileType}</td>
                    </tr>
                    <tr>
                        <td>File Size In Bytes</td>
                        <td>${numbInBytes}</td>
                    </tr>
                </table>
                `;

    const el = elIdDom('append-details');
    el.innerHTML = html;
}
/* S:rendering response */

/* S:toggling with class */
function hideNotification(className) {
    elSelDom("."+className).classList.toggle("hidden");
}
/* E:toggling with class */