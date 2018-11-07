import React from 'react'
import FormValidator from '../FormValidator/FormValidator'
import axios from 'axios'
import './Chat.css'

class Chat extends React.Component {
constructor(props){ 
    super(props);
    this.validator = new FormValidator([
    {
        field: 'message',
        method: 'isEmpty',
        validWhen: false,
        message: 'Please type something.'
    },
    {
        field: 'message',
        method: 'isAscii',
        validWhen: true,
        message: 'Injections are not allowed'
    }
    ])
    this.state = {
        username: localStorage.login,
        message: {},
        messages: {},
        uid: localStorage.id,
        room: {},
        done: false,
        currentInput: null,
        display: {}
        
    }
    this.update = this.update.bind(this)
    this.socket = this.props.socket
    this.socket.on('RECEIVE_MESSAGE', (data) => {
        let id = localStorage.id
        this.update(id)
    })
 
    
        this.sendMessage = (e, token) => {
            e.preventDefault();
            const validation = this.validator.validate(this.state)
            this.setState({ validation })
            this.submitted = true
            if (validation.isValid){
                this.socket.emit('SEND_MESSAGE', {
                    author: this.state.username,
                message: this.state.message["mess" + token],
                messages: this.state.messages,
                id: this.state.uid,
                room: token
            })
            this.setState({message: {...this.state.message, ["mess" + token]: ''}})
        }
    }
}

update = (id) => {
    axios.post('getAllMess', { id })
    .then((result) => {
        this.setState({
            messages: result.data,
            done: true
        })
    })
}
componentWillMount = (e) => {
    let id = localStorage.id
    if (id) {
        this.socket.on('receive/conv/' + id, (data) => {
            this.setState({
                room: data
            })
            let message = {}
            let disp = {}
            for (let i = 0; i < data.length; i++) {
                this.socket.emit('joinRoom', data[i].token_room)
                message["mess" + data[i].token_room] = ''
                disp[data[i].token_room] = {display: 'none'}
                if (i === data.length - 1) {
                    this.setState({
                        message: message,
                        display: disp,
                        done: true
                    })
                }
            }
        })
        this.socket.emit('getAll/Conv', {id})
        axios.post('getAllMess', { id })
        .then((result) => {
            this.setState({
                messages: result.data,
            })
        })
    }
}

handleChange = (e) => {
    e.preventDefault()
    this.setState({
        message: {...this.state.message, [e.target.name]: e.target.value}
    })
}

displayChat = (e, room) => {
    e.preventDefault()
    let disp = this.state.display
    Object.keys(disp).map((key) => {
        disp[key] = {display: 'none'}
        if (key === room)
            disp[key] = {display: 'block'}
        return null
    })
    this.setState({
        display: disp
    })
}

render() {
    const {room, done, messages, message, display} = this.state
    console.log(message)
    let allRoom = null
    let allUser = null
    if (room.length > 0 && done && Object.keys(message).length > 0) {
        allUser = room.map((key, i) =>
        <div key={i}>
            <span className="user" style={{cursor: 'pointer'}} onClick={e => this.displayChat(e, key.token_room)}>{key.uname}</span>
        </div>
        )
        allRoom = room.map((key, i) =>
            <div className="container" key={i} style={display[key.token_room]}>
            <div className="row">
                <div className="col-4">
                    <div className="card">
                        <div className="card-body">
                            <div className="card-title" align="center">Chat</div>
                            <hr/>
                            <div className="messages">
                                {messages[key.token_room] ? 
                                Object.keys(messages[key.token_room]).map((message, key2) => {
                                    return (
                                        <div key={key2} >{messages[key.token_room][message].author}: {messages[key.token_room][message].message}</div>
                                    )
                                }) : ''}
                            </div>
                        </div>
                        <div className="card-footer">
                            <input type="text" placeholder="Username" className="form-control" value={this.state.username} readOnly />
                            <br/>
                            <input id={key.token_room} name={`mess${key.token_room}`} type="text" placeholder="Message" className="form-control" value={message["mess" + key.token_room]} onChange={this.handleChange}/>
                            <br/>
                            <button onClick={e => this.sendMessage(e, key.token_room)} className="btn btn-primary form-control">Send</button>
                        </div>
                    </div>
                    <div className='test'>
                        {this.state.all}
                    </div>
                </div>
            </div>
        </div>
        )
    }
    <div className='test'>
    {this.state.all}
    </div>
        return (
            <div>
                {allUser}
                {allRoom}
            </div>
        )
    }
}

export default Chat
