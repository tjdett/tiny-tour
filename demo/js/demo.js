var modal;

let cb = () => {
    console.log("modal footer clicked");
    modal.close();
}

$(document).ready(() => {
    modal = new tingle.modal({
        footer: true,
        stickyFooter: false,
        closeMethods: ['overlay', 'button', 'escape'],
        closeLabel: "Close",
        cssClass: ['modal-test', 'custom-class-2'],
        onOpen: function() {
            console.log('modal open');
        },
        onClose: function() {
            console.log('modal closed');
        },
        beforeClose: function() {
            // here's goes some logic
            // e.g. save content before closing the modal
            return true; // close the modal
            return false; // nothing happens
        }
    });

    // set content
    modal.setContent('<h1>Welcome to Tiny starter pack</h1><p>intro</p>');
    modal.addFooterBtn('Click', 'button-primary', cb);
    modal.open();
});

// const help = document.getElementById('help');
// help.addEventListener('click', () => {
//     console.log('help clicked');
//     modal.open();
// });