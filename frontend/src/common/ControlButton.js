import React, { Component } from 'react';

import './ControlButton.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class ControlButton extends Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
        isActive: PropTypes.bool.isRequired,
    }

    render() {
        const justLog = () => {
            console.log("Button is not active.");
        }
        return <div onClick={this.props.isActive ? this.props.action : justLog} className={`control-button ${this.props.isActive ? "" : "control-button-grey"}`}>{this.props.label}</div>
    }
}

const mapStateToProps = (state, props) => {
    return {};
}

const mapDispatchToProps = dispatch => {
    return { dispatch: dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlButton);