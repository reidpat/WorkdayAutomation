(async () => {
    const overlay = document.createElement('div');
    overlay.style = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

    const form = document.createElement('form');
    form.innerHTML = `
  <h2>Select Days and Times</h2>
  <div>
    <label>
      <input type="checkbox" name="days[]" value="Mon" checked>
      Mon
    </label>
    <label>
      <input type="checkbox" name="days[]" value="Tue" checked>
      Tue
    </label>
    <label>
      <input type="checkbox" name="days[]" value="Wed" checked>
      Wed
    </label>
    <label>
      <input type="checkbox" name="days[]" value="Thu" checked>
      Thu
    </label>
    <label>
      <input type="checkbox" name="days[]" value="Fri" checked>
      Fri
    </label>
  </div>
  <div>
    <label>
      Start Time:
      <input type="text" name="start" placeholder="8:30 AM">
    </label>
  </div>
  <div>
    <label>
      End Time:
      <input type="text" name="end" placeholder="3:30 PM">
    </label>
  </div>
  <div>
    <button type="submit">OK</button>
    <button type="button" id="cancel-button">Cancel</button>
  </div>
  <p>Made by Reid, who was angry that this wasn't an included feature in WorkDay</p>
`;
    form.style = `
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

    overlay.appendChild(form);
    document.body.appendChild(overlay);

    const cancelButton = form.querySelector('#cancel-button');
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    let days = [];
    let start = "8:30 AM";
    let end = "3:30 PM";
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        days = formData.getAll('days[]');
        start = !formData.get('start') ? "8:30 AM" : formData.get('start');
        end = !formData.get('end') ? "3:30 PM" : formData.get('end');
        console.log(days, start,  end);
        document.body.removeChild(overlay);
        for (let i = 0; i < days.length; i++) {
            let day = days[i];
            // Utility function to create and dispatch a custom pointerdown event
            let dispatchEventsA = (element, clientX, clientY) => {
                const pointerDownEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                    clientX: clientX,
                    clientY: clientY,
                    pointerType: 'mouse',
                });
    
                const mouseDownEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    clientX: clientX,
                    clientY: clientY,
                    button: 0,
                });
    
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    clientX: clientX,
                    clientY: clientY,
                    button: 0,
                });
    
                element.dispatchEvent(pointerDownEvent);
                element.dispatchEvent(mouseDownEvent);
                element.dispatchEvent(clickEvent);
            };
    
            // Find the div containing "Mon"
            const dayCellContainer = document.querySelector('.day-cell-container');
            const targetDayCell = Array.from(dayCellContainer.children).find(cell => cell.textContent.includes(day));
    
            if (targetDayCell) {
                console.log('Found target day cell:', targetDayCell);
    
                // Get the bounding rectangle of the target div
                const rect = targetDayCell.getBoundingClientRect();
    
                // Calculate the position to click
                const clickX = rect.left + rect.width / 2;
                const clickY = rect.top + rect.height / 2 + 100;
    
                // Find the element located at the click position
                const elementToClick = document.elementFromPoint(clickX, clickY);
    
                if (elementToClick) {
                    console.log('Found element to click:', elementToClick);
    
                    // Trigger the pointerdown event on the element located at the click position
                    dispatchEventsA(elementToClick, clickX, clickY);
                } else {
                    console.log('No element found at the click position');
                }
            } else {
                console.log(`Div containing ${day} not found`);
            }
            // Utility functions
            const dispatchEvents = (element, eventType) => {
                const event = new MouseEvent(eventType, {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                element.dispatchEvent(event);
            };
    
            // Interact with the popup
            const waitForPopup = (selector) => {
                return new Promise((resolve, reject) => {
                    const checkExist = setInterval(() => {
                        const popup = document.querySelector(selector);
                        if (popup) {
                            clearInterval(checkExist);
                            resolve(popup);
                        }
                    }, 100);
    
                    setTimeout(() => {
                        clearInterval(checkExist);
                        reject(new Error(`Popup with selector "${selector}" not found`));
                    }, 10000); // Timeout after 10 seconds
                });
            };
    
            const sleep = (ms) => {
                return new Promise((resolve) => setTimeout(resolve, ms));
            };
    
            const clickElement = async (element) => {
                const clickEventTypes = [
                    'click',
                    'mousedown',
                    'mouseup',
                    'pointerdown',
                    'pointerup',
                ];
    
                for (const eventType of clickEventTypes) {
                    dispatchEvents(element, eventType);
                    await sleep(100);
                }
            };
    
            const simulateTyping = async (element, text) => {
                const inputEvent = new Event('input', { bubbles: true });
                const keydownEvent = new KeyboardEvent('keydown', { bubbles: true });
                const keyupEvent = new KeyboardEvent('keyup', { bubbles: true });
    
                for (const char of text) {
                    element.value += char;
                    element.dispatchEvent(inputEvent);
                    element.dispatchEvent(keydownEvent);
                    element.dispatchEvent(keyupEvent);
                    await sleep(50);
                }
            };
    
            waitForPopup('.wd-popup')
                .then(async (popup) => {
                    const methods = [
                        () => popup.querySelectorAll('.gwt-TextBox'),
                        () => popup.querySelectorAll('input[type="text"]'),
                        () => popup.querySelectorAll('.wd-input-field')
                    ];
    
                    let textboxes = [];
                    let i = 0;
                    while (textboxes.length < 2 && i < methods.length) {
                        textboxes = methods[i]();
                        if (textboxes.length < 2) {
                            await new Promise((resolve) => setTimeout(resolve, 2000));
                        }
                        i++;
                    }
    
                    if (textboxes.length >= 2) {
                        let j = 0;
                        while (j < textboxes.length) {
                            // Click into the textbox
                            dispatchEvents(textboxes[j], 'click');
                            await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for formatting code to run
                            textboxes[j].value = j === 0 ? start : end;
                            dispatchEvents(textboxes[j], 'blur');
    
                            j++;
                        }
    
                        // Click the OK button
                        const okButton = popup.querySelector('[title="OK"]');
                        if (okButton) {
                            dispatchEvents(okButton, 'mousedown');
                            dispatchEvents(okButton, 'mouseup');
                            dispatchEvents(okButton, 'click');
                        } else {
                            console.error('OK button not found');
                        }
                    } else {
                        console.error('Not enough textboxes found');
                    }
                })
                .catch((error) => {
                    console.error(error.message);
                });
            await sleep(10000);
        }
    });



})();