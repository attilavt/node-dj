import React, { Component } from 'react';

import './ControlButton.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class ControlButton extends Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired
    }

    render() {
        return <div onClick={this.props.action} className="control-button">{this.props.label}</div>
    }
}

const mapStateToProps = (state, props) => {
    return {};
}

const mapDispatchToProps = dispatch => {
    return { dispatch: dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlButton);