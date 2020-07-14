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

import {createCanvas, WebRtcPeer} from './WebRtcPeer'
import WebRtcPeerCore from './WebRtcPeerCore'


export {WebRtcPeer, WebRtcPeerCore}


//
// Specialized child classes
//

export class WebRtcPeerRecvonly extends WebRtcPeer
{
  constructor(options) {
    super('recvonly', options)
  }
}

export class WebRtcPeerSendonly extends WebRtcPeer
{
  constructor(options) {
    super('sendonly', options)
  }
}

export class WebRtcPeerSendrecv extends WebRtcPeer
{
  constructor(options) {
    super('sendrecv', options)
  }
}


export default {
  WebRtcPeer,
  WebRtcPeerCore,
  WebRtcPeerRecvonly,
  WebRtcPeerSendonly,
  WebRtcPeerSendrecv
}


// https://github.com/Automattic/node-canvas/issues/487
export {createCanvas}
