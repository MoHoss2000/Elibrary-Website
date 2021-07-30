document.getElementById("readlist").onclick = function () {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/addbook', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        name: document.title
    }));

    xhr.onload = function () {
        alert(this.responseText);

    }
}
