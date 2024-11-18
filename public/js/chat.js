class MemberElement {
    constructor(username="",pfpUrl="",id="") {
        const template = document.createElement("template");
        template.innerHTML = `
        <div class="member">
            <img width="32px" height="32px" class="pfp" src="${pfpUrl}">
            <span class="username">${username}</span>
        </div>
        `;

        this.element = template.content.cloneNode(true).firstElementChild;
    }

    append(parent) {
        parent.appendChild(this.element);
    }

    destroy() {
        this.element.remove();
        this.element = null;
    }
}

export function init(socket){
    for (let i=0; i<10; i++) {
        const memberElement = new MemberElement("test","/assets/icons/account.svg","dsadkj");
        memberElement.append(document.getElementsByClassName("members")[0]);
    }
}