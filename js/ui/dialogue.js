export class DialogueSystem {
    showDialogue(name, text) {
        const box = document.getElementById('dialogue-box');
        box.classList.remove('hidden');
        document.getElementById('dialogue-name').innerText = name;
        document.getElementById('dialogue-text').innerText = text;
        setTimeout(() => box.classList.add('hidden'), 4000);
    }
}
export const dialogue = new DialogueSystem();