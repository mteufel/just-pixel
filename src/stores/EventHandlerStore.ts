
// EventHandlerStore helps to remember global registerred Event-Handlers.
// On Component Re-Render where we put e.g. KeyDown-EventListers in OnMounted-LifecycleHandlers
// you have to make sure to remove EventHandlers before adding another one, otherwise you may get too much events!
const createEventHandlerStore = () => {

    type JustPixelEvent = {
        name: string,
        eventType: string,
        listener: EventListener
    }

    let listeners : JustPixelEvent[] = []



    return {
        addEventListener: (name : string, eventType : string, listener : EventListener) => {

            let listenersToRemove = listeners.filter( l => l.name === name && l.eventType === eventType)
            listeners = listeners.filter( l => !listenersToRemove.includes(l))
            listenersToRemove.forEach( l => {
                window.removeEventListener(l.eventType, l.listener, false)
            })
            listeners.push( { name: name, eventType: eventType, listener: listener } )
            window.addEventListener(eventType, listener)

        }
    }
}

const EventHandlerStore = createEventHandlerStore()

export default EventHandlerStore

