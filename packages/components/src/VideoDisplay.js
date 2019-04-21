import React, { PureComponent, Component } from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';

import { playerContextFilter, logWarning } from '@cassette/core';

// 'x:y' -> x / y
function extractAspectRatio(aspectRatio) {
  const values = aspectRatio.split(':').map(Number);
  return values[0] / values[1];
}

const defaultBgColor = '#000';

class InjectedCanvas extends Component {
  componentDidMount() {
    this.div.appendChild(this.props.canvas);
  }

  render() {
    return (
      <div
        style={{ width: this.props.containerWidth }}
        ref={elem => (this.div = elem)}
      />
    );
  }
}

InjectedCanvas.propTypes = {
  containerWidth: PropTypes.number,
  canvas: PropTypes.instanceOf(
    typeof HTMLCanvasElement === 'undefined' ? Object : HTMLCanvasElement
  )
};

/**
 * A container for the video content from the surrounding [`playerContext`](#playercontext)
 */
export class VideoDisplay extends PureComponent {
  constructor(props) {
    super(props);
    // using instance properties instead of React state to make sure
    // we can avoid annoying race conditions
    this.containerWidth = 0;
    this.containerHeight = 0;
    this.hostedVideo = null;
    this.videoFrameAtTimeLastVacated = null;
  }

  componentDidMount() {
    this.containerResizeObserver = new ResizeObserver(
      this.handleContainerResize.bind(this)
    );
    this.containerResizeObserver.observe(this.containerElement);

    this.props.registerVideoHostElement(this.containerElement, {
      onHostOccupied: videoElement => {
        videoElement.style.width = `${this.containerWidth}px`;
        videoElement.style.maxHeight = `${this.containerHeight}px`;
        this.hostedVideo = videoElement;
        this.forceUpdate();
      },
      onHostVacated: videoElement => {
        // TODO: take into account container size and pixel density
        // when sizing videoFrame canvas element?
        const videoFrame = document.createElement('canvas');
        videoFrame.width = videoElement.videoWidth;
        videoFrame.height = videoElement.videoHeight;
        videoFrame
          .getContext('2d')
          .drawImage(videoElement, 0, 0, videoFrame.width, videoFrame.height);
        videoFrame.style.maxWidth = '100%';
        // 'vertical-align: middle' avoids unneeded 3px buffer below canvas
        videoFrame.style.verticalAlign = 'middle';
        this.videoFrameAtTimeLastVacated = videoFrame;
        this.hostedVideo = null;
        this.forceUpdate();
      }
    });
    this.props.renderVideoIntoHostElement(this.containerElement);
  }

  componentWillUnmount() {
    this.containerResizeObserver.disconnect();
    this.props.unregisterVideoHostElement(this.containerElement);
  }

  handleContainerResize() {
    const { offsetWidth, offsetHeight } = this.containerElement;
    if (
      offsetWidth === this.containerWidth &&
      offsetHeight === this.containerHeight
    ) {
      return;
    }

    if (this.hostedVideo) {
      this.hostedVideo.style.width = `${offsetWidth}px`;
      this.hostedVideo.style.maxHeight = `${offsetHeight}px`;
    }
    this.containerWidth = offsetWidth;
    this.containerHeight = offsetHeight;
    this.forceUpdate();
  }

  render() {
    const {
      aspectRatio,
      fullscreen,
      maintainAspectRatioInFullscreen,
      renderPlaceholderContent,
      renderVideoIntoHostElement,
      ...attributes
    } = this.props;
    delete attributes.registerVideoHostElement;
    delete attributes.unregisterVideoHostElement;

    const containerStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: defaultBgColor,
      ...(attributes.style || {})
    };
    if (
      aspectRatio &&
      this.containerWidth &&
      (!fullscreen || maintainAspectRatioInFullscreen)
    ) {
      if (containerStyle.height && !this.warnedAboutStyleOverride) {
        logWarning(
          'VideoDisplay cannot use style.height prop because it is ' +
            'overridden by aspectRatio.'
        );
        this.warnedAboutStyleOverride = true;
      }
      // h = w/(x/y)  -->  h*(x/y) = w  -->  x/y = w/h
      containerStyle.height =
        this.containerWidth / extractAspectRatio(aspectRatio);
    }

    return (
      <div
        {...attributes}
        style={containerStyle}
        ref={elem => (this.containerElement = elem)}
      >
        {this.hostedVideo
          ? null
          : renderPlaceholderContent({
              containerWidth: this.containerWidth,
              containerHeight: this.containerHeight,
              stealVideo: () =>
                renderVideoIntoHostElement(this.containerElement),
              renderLastShownFrame: () =>
                this.videoFrameAtTimeLastVacated && (
                  <InjectedCanvas
                    canvas={this.videoFrameAtTimeLastVacated}
                    containerWidth={this.containerWidth}
                  />
                )
            })}
      </div>
    );
  }
}

function aspectRatioString(props, propName) {
  const prop = props[propName];
  if (prop === undefined) {
    return;
  }
  if (
    typeof prop !== 'string' ||
    prop.split(':').length !== 2 ||
    prop.split(':').some(isNaN)
  ) {
    return new Error(
      `The ${propName} prop should be a string of the form 'x:y'. Example: 16:9`
    );
  }
}

VideoDisplay.propTypes = {
  registerVideoHostElement: PropTypes.func.isRequired,
  renderVideoIntoHostElement: PropTypes.func.isRequired,
  unregisterVideoHostElement: PropTypes.func.isRequired,
  fullscreen: PropTypes.bool,
  /** A string representation of the display's fixed aspect ratio */
  aspectRatio: aspectRatioString,
  /**
   * In fullscreen we normally want to use the aspect ratio of the device
   * display, but if you don't like this behavior, you can override it.
   */
  maintainAspectRatioInFullscreen: PropTypes.bool.isRequired,
  /**
   * A function which should return a React element to display as a placeholder
   * when the display is unused (i.e. a different `VideoDisplay` elsewhere on
   * the screen currently is displaying the video content). This function is
   * passed a `params` object with three properties: `containerWidth` (a
   * number), `containerHeight` (a number) and `renderLastShownFrame` (a
   * function which will returning a React element showing a canvas snapshot
   * of the last frame that was shown before the video was moved out of this
   * display - platforms like Facebook render frames like this. only works for
   * actual video content, not audio poster images.)
   */
  renderPlaceholderContent: PropTypes.func.isRequired
};

VideoDisplay.defaultProps = {
  aspectRatio: '16:9',
  maintainAspectRatioInFullscreen: false,
  renderPlaceholderContent(params) {
    const { containerWidth, containerHeight, renderLastShownFrame } = params;
    return (
      <div
        style={{
          width: containerWidth,
          height: containerHeight,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {renderLastShownFrame()}
      </div>
    );
  }
};

export default playerContextFilter(VideoDisplay, [
  'registerVideoHostElement',
  'renderVideoIntoHostElement',
  'unregisterVideoHostElement',
  'fullscreen'
]);
