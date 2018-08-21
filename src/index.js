import React from 'react';
import ReactDOM from 'react-dom';

import wordList from 'wordList';
import Bruteforcer from 'webWorker';

import 'index.css';

const webWorker = new Bruteforcer();

class App extends React.Component {
    constructor(...args) {
        super(...args);

        this.state = {
            promise: false,
            words: new Array(24).fill(''),
            publicKey: '',
            unknown: 0,
            running: false,
            error: false,
            found: false,
            status: 'Waiting for valid input'
        };

        webWorker.addEventListener('message', ({ data: response }) => {
            const {
                type,
                status,
                word,
                words
            } = response;

            switch(type) {
                case 'stateUpdate':
                    return this.setState({
                        status
                    });
                case 'fail':
                    return this.setState({
                        status: 'We were unable to find the missing word',
                        running: false
                    });
                case 'success':
                    return this.setState({
                        status: `Found missing word: ${word}`,
                        running: false,
                        found: word,
                        words
                    });
                default:
                    return console.warn('Invalid message sent from worker:', response);
            }
        }, false);
    }

    checkForErrors() {
        let error = this.state.words.some((word, index) => this.state.unknown !== index && !wordList.includes(word));
        let status = 'Waiting for valid input';

        if(this.state.publicKey.length !== 34)
            error = true;

        if(!error)
            status = 'Waiting for user to start';

        this.setState({
            found: false,
            error,
            status
        });
    }

    handleWordChange(word, index) {
        const lowerCaseWord = word.toLowerCase().replace(/[^a-z]/g, '');

        const { words } = this.state;
        words[index] = lowerCaseWord;

        this.setState({
            words
        });

        this.checkForErrors();
    }

    handleUnknownChange(index) {
        const { words } = this.state;
        let { unknown } = this.state;

        words[index] = '';
        unknown = +index;

        this.setState({
            words,
            unknown
        });

        this.checkForErrors();
    }

    handleAddressChange(publicKey) {
        const transformedAddress = publicKey.replace(/[^\w]/g, '');

        this.setState({
            publicKey: transformedAddress
        });

        this.checkForErrors();
    }

    renderInputs() {
        return new Array(12).fill(0).map((_, x) => {
            const inputs = [ 0, 12 ].map(y => {
                const index = x + y;
                const word = this.state.words[index];

                return (
                    <input
                        type='text'
                        value={ word }
                        placeholder={ `Word ${index + 1}` }
                        key={ index }
                        onChange={ ({ target: { value } }) => this.handleWordChange(value, index) }
                        disabled={ this.state.unknown === index || this.state.running }
                        className={ (!wordList.includes(word) && this.state.unknown !== index) ? 'invalid' : 'valid' }
                        tabIndex={ index + 2 } />
                );
            });

            return (
                <div className='input-row' key={ x }>
                    { inputs }
                </div>
            );
        });
    }

    renderUnknownChoice() {
        const options = this.state.words.map((_, index) => (
            <option value={ index } key={ index }>Missing word { index + 1 }</option>
        ));

        return (
            <select
                value={ this.state.unknown }
                onChange={ ({ target: { value } }) => this.handleUnknownChange(value) }
                tabIndex={ 1 }
                disabled={ this.state.running }>
                { options }
            </select>
        );
    }

    start() {
        this.setState({
            running: true,
            status: 'Searching for missing word. This may take some time'
        });

        webWorker.postMessage({
            address: this.state.publicKey,
            words: this.state.words,
            unknown: this.state.unknown
        });
    }

    renderButton() {
        const classes = [ 'button' ];

        if(this.state.running || this.state.error)
            classes.push('disabled');
        else classes.push('start');

        return (
            <div className={ classes.join(' ') } onClick={ () => !classes.includes('disabled') && !this.state.found && this.start() } tabIndex={ 27 }>
                { 'Start' }
            </div>
        );
    }

    render() {
        return (
            <div className='container'>
                <div className='header'>
                    <div className='header-text'>
                        <h1>Tron Bip39 Seed Recovery</h1>
                        <p>
                            This utility enables you to recover a missing word in your recovery phrase (mnemonic seed).

                            Enter your address and select the missing word below. Fill in the rest of the words that you
                            have access to and press run.

                            It can take a few minutes depending on your hardware. Please be patient.
                        </p>
                    </div>
                    <div className='input-row'>
                        <input
                            type='text'
                            placeholder='Account address'
                            value={ this.state.publicKey }
                            onChange={ ({ target: { value } }) => this.handleAddressChange(value) }
                            className={ (this.state.publicKey.length !== 34) ? 'invalid' : '' }
                            tabIndex={ 0 }
                            disabled={ this.state.running } />
                        { this.renderUnknownChoice() }
                    </div>
                </div>

                { this.renderInputs() }

                <div className='footer'>
                    <div className='status'>
                        { this.state.status }
                    </div>
                    { this.renderButton() }
                </div>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));