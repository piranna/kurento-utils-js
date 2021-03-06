/*
 * (C) Copyright 2014-2020 Kurento (http://kurento.org/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This module contains a set of reusable components that have been found useful
 * during the development of the WebRTC applications with Kurento.
 *
 * @module kurentoUtils
 *
 * @copyright 2014 Kurento (http://kurento.org/)
 * @license ALv2
 *
 * @author Jesús Leganés Combarro "piranna" (piranna@gmail.com)
 * @since 4.2.4
 */

import UAParser from 'ua-parser-js'
import {MediaStream} from 'wrtc'

import {WebRtcPeerCore, createCanvas} from './WebRtcPeerCore'


// Somehow, the UAParser constructor gets an empty window object.
// We need to pass the user agent string in order to get information
const ua = typeof window !== 'undefined' && window.navigator?.userAgent || ''
const parser = new UAParser(ua)
const {name} = parser.getBrowser()

const usePlanB = name === 'Chrome' || name === 'Chromium'


/**
 * Wrapper object of an {RTCPeerConnection}. This object is aimed to simplify
 * the development of WebRTC-based applications.
 */
export class WebRtcPeer extends WebRtcPeerCore
{
  /**
   * @constructor module:kurentoUtils.WebRtcPeer
   *
   * @param {String} mode Mode in which the PeerConnection will be configured.
   *  Valid values are: 'recv', 'send', and 'sendRecv'
   * @param {Object} [options]
   * @param {MediaStream} [options.audioStream] Stream to be used as second
   *  source (typically for audio) for localVideo and to be added as stream to
   *  the {RTCPeerConnection}
   * @param {HTMLVideoElement} [options.localVideo] Video tag for the local
   *  stream
   * @param {HTMLVideoElement} [options.remoteVideo] Video tag for the remote
   *  stream
   * @param {MediaStream} [options.videoStream] Stream to be used as primary
   *  source (typically video and audio, or only video if combined with
   *  audioStream) for localVideo and to be added as stream to the
   *  {RTCPeerConnection}
   */
  constructor(mode, options, callback)
  {
    if (options instanceof Function) {
      callback = options
      options = undefined
    }

    const {localVideo, remoteVideo, ...coreOptions} = options || {}

    super(mode, {usePlanB, ...coreOptions}, callback)

    this.#localVideo = localVideo
    this.#remoteVideo = remoteVideo

    this.on('setRemoteVideo', this.#setRemoteVideo)
    this.on('setLocalVideo', this.#setLocalVideo)
  }


  //
  // Public API
  //

  /**
   * @member {(external:ImageData|undefined)} currentFrame
   */
  get currentFrame() {
    let video = this.#remoteVideo
    if (!video) {
      // We have a remote stream but we didn't set a remoteVideo tag
      const receivers = this.peerConnection.getReceivers()
      if(!receivers.length)
        throw new Error('No remote video stream available')

      const stream = new MediaStream();

      for(const {track} of receivers) stream.addTrack(track);

      video = document.createElement('video')
      video.srcObject = stream
    }
    else if (video.readyState < video.HAVE_CURRENT_DATA)
      throw new Error('No remote video stream data available')

    const canvas = createCanvas(video.videoWidth, video.videoHeight)

    canvas.getContext('2d').drawImage(video, 0, 0)

    if (!this.#remoteVideo) {
      video.pause();
      video.srcObject = null
      video.load();
    }

    return canvas
  }

  get localVideo() {
    return this.#localVideo
  }

  get remoteVideo() {
    return this.#remoteVideo
  }

  /**
   * @description This method frees the resources used by WebRtcPeer.
   *
   * @function module:kurentoUtils.WebRtcPeer.prototype.dispose
   */
  dispose() {
    if (this.#localVideo) {
      this.#localVideo.pause();
      this.#localVideo.srcObject = null;
      this.#localVideo.load();
      this.#localVideo.muted = false;
    }

    if (this.#remoteVideo) {
      this.#remoteVideo.pause();
      this.#remoteVideo.srcObject = null;
      this.#remoteVideo.load();
    }

    super.dispose()
  }


  //
  // Deprecated public APIs
  //

  /**
   * Get local session descriptor
   *
   * @deprecated use `WebRtcPeerCore.peerConnection.localDescription` instead
   */
  /* istanbul ignore next */
  getLocalSessionDescriptor() {
    return this.peerConnection.localDescription
  }

  /**
   * Get local stream
   *
   * @deprecated use directly `WebRtcPeerCore.getSender()`
   */
  /* istanbul ignore next */
  getLocalStream(index) {
    const stream = new MediaStream()

    for(const {track} of this.getSender(index))
      stream.addTrack(track);

    return stream
  }

  /**
   * Get remote session descriptor
   *
   * @deprecated use `WebRtcPeerCore.peerConnection.remoteDescription` instead
   */
  /* istanbul ignore next */
  getRemoteSessionDescriptor() {
    return this.peerConnection.remoteDescription
  }

  /**
   * Get remote stream
   *
   * @deprecated use directly `WebRtcPeerCore.getReceiver()`
   */
  /* istanbul ignore next */
  getRemoteStream(index) {
    const stream = new MediaStream()

    for(const {track} of this.getSender(index))
      stream.addTrack(track);

    return stream
  }

  /**
   * Set the local video to the current local video stream
   *
   * @deprecated Local video is automatically set, this is a no-op, don't use it
   */
  /* istanbul ignore next */
  showLocalVideo() {}


  //
  // Private API
  //

  #localVideo
  #remoteVideo

  #setRemoteVideo = () => {
    if (!this.#remoteVideo) return

    const stream = new MediaStream();

    for(const {track} of this.peerConnection.getReceivers())
      stream.addTrack(track);

    this.#remoteVideo.pause()
    this.#remoteVideo.srcObject = stream
    this.#remoteVideo.load();
  }

  #setLocalVideo()
  {
    if (!this.#localVideo) return

    this.#localVideo.srcObject = this.videoStream
    this.#localVideo.muted = true
  }
}


export default WebRtcPeer


// https://github.com/Automattic/node-canvas/issues/487
export {createCanvas}
