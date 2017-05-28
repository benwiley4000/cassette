import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import PurePropTypesComponent from './PurePropTypesComponent';

class SkipButton extends PurePropTypesComponent {
  render () {
    const { back, onClick } = this.props;
    return (
      <div
        className={classNames(
          'rr_audio_player__skip_button rr_audio_player__audio_button',
          { back }
        )}
        onClick={onClick}
      >
        <div className="skip_button_inner">
          <div className="right_facing_triangle foreground"></div>
          <div className="right_facing_triangle foreground"></div>
        </div>
      </div>
    );
  }
}

SkipButton.propTypes = {
  back: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

module.exports = SkipButton;