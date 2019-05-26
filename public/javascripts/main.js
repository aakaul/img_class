window.onload = function () {
    dragAndDrop();
    selectToUpload();
};

let dropArea = document.getElementById('drop-area');

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

function selectToUpload() {
    document.getElementById('img').addEventListener('change', function () {
        (this.value.length > 0) ?
        handleDrop(): false;
    });
}

function handleDrop(e) {
    let file = (e) ? e.dataTransfer.files : false;
    if (file) {
        document.getElementById('img').files = file;
    }
    const {
        numbInBytes,
        fileName
    } = fileDetails();

    if (validateFileType() && validateFileSize(numbInBytes)) {
        document.querySelector(".err-falied").classList.add("hidden");
        document.querySelector('.file-name').innerHTML = fileName;
        previewFile();
        uploadFile(numbInBytes);
    }
}

function fileDetails() {
    const file = document.getElementById("img").files[0];
    const numbInBytes = file.size;
    const fileType = file.type;
    const fileName = file.name;
    return {
        numbInBytes,
        fileName,
        fileType
    }
}


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

async function uploadFile() {
    document.querySelector("#svg-load").classList.remove("hidden");
    let data = new FormData();
    data.append('img', await getFileInbase64());
    try {
        var res = await fetch('/detect-objects', {
            method: 'POST',
            body: data
        });
        document.querySelector("#svg-load").classList.add("hidden");
    } catch (err) {
         return hideNotification('err-falied');
    }
    const resJson = await res.json();
    if (resJson.status == 'success') {
        appendResult(resJson.object);
        apenAdditionalData(resJson.resolution);
    } else {
        hideNotification('err-falied');
    }

}

async function previewFile() {
    let img = document.createElement('img')
    img.src = await getFileInbase64()
    el = document.getElementById('gallery')
    el.innerHTML = '<h3><strong>Image Preview</strong></h3><br>';
    el.appendChild(img);
}


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

function getFileInbase64() {
    return new Promise((resolve, reject) => {
        const file = document.getElementById('img').files[0]
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = _ => resolve(reader.result);
        reader.onerror = err => console.error(err)
    })
}

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

    var el = document.getElementById('append-result');

    el.innerHTML = html;

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

    var el = document.getElementById('append-details');
    el.innerHTML = html;
}

function hideNotification(className) {
    document.querySelector("."+className).classList.toggle("hidden");
}