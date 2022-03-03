// @flow
// This file seletively brings in some lines from
// node_modules/react-native/Libraries/react-native/react-native-interface.js
// If we use the entire "lib" in our `.flowconfig` it erases the flowtypes
// for `fetch`.

declare var __DEV__: boolean;

// Copied from webapp: javascript/shared-package/learning-time/types.js
// Marks all properties of an object optional.
//
// We use this instead of $Shape<T> because spreading $Shape<$Exact<T>> ends up
// spreading $Exact<T> instead, losing the optionality of keys.
// https://github.com/facebook/flow/issues/6906#issuecomment-453439922
export type Partial<T> = $ReadOnly<$Rest<T, {}>>;

type GlobalHandler = (error: Error, isFatal: boolean) => void;
declare var ErrorUtils: ?{
    getGlobalHandler: ?() => GlobalHandler,
    _globalHandler: GlobalHandler,
    setGlobalHandler: GlobalHandler => void,
};

declare module debounce {
    declare export default function debounce<A: Function>(
        f: A,
        interval?: number,
        immediate?: boolean,
    ): A & {clear(): void} & {flush(): void};
}

declare module 'comma-number' {
    declare export default function commas(
        number: number,
        separator: string,
        decimalChar: string,
    ): string;
}

declare module 'graphql' {
    declare module.exports: any;
}

declare module 'graphql/language/printer' {
    declare module.exports: any;
}

declare module 'metro-bundler/src/lib/TerminalReporter' {
    declare module.exports: any;
}

declare module 'metro-bundler' {
    declare module.exports: any;
}

declare module '../../local-cli/bundle/assetPathUtils' {
    declare module.exports: any;
}

declare module 'InteractionManager' {
    declare module.exports: any;
}

// Ported from TypeScript definitions for oauth-1.0a v2.2.3
declare module 'oauth-1.0a' {
    /**
     * OAuth data, including the signature.
     */
    declare interface Authorization extends Data {
        oauth_signature: string;
    }

    /**
     * Method used to generate the body hash.
     *
     * Note: the key is used for implementation HMAC algorithms for the body hash,
     * but typically it should return SHA1 hash of base_string.
     */
    declare function BodyHashFunction(base_string: string, key: string): string;

    /**
     * OAuth key/secret pair.
     */
    declare interface Consumer {
        key: string;
        secret: string;
    }

    /**
     * OAuth data, excluding the signature.
     */
    declare interface Data {
        oauth_consumer_key: string;
        oauth_nonce: string;
        oauth_signature_method: string;
        oauth_timestamp: number;
        oauth_version: string;
        oauth_token?: string;
        oauth_body_hash?: string;
    }

    /**
     * Method used to hash the the OAuth and form/querystring data.
     */
    declare function HashFunction(base_string: string, key: string): string;

    /**
     * Authorization header.
     */
    declare interface Header {
        Authorization: string;
    }

    /**
     * OAuth options.
     */
    declare interface Options {
        body_hash_function?: typeof BodyHashFunction;
        consumer: Consumer;
        hash_function?: typeof HashFunction;
        last_ampersand?: boolean;
        nonce_length?: number;
        parameter_seperator?: string;
        /**
         * Realm is excluded from headers if missing here
         */
        realm?: string;
        /**
         * Defaults to 'PLAINTEXT'
         */
        signature_method?: string;
        version?: string;
    }

    /**
     * Extra data.
     */
    declare interface Param {
        [key: string]: string | string[];
    }

    /**
     * Request options.
     */
    declare interface RequestOptions {
        url: string;
        method: string;
        data?: any;
        includeBodyHash?: boolean;
    }

    /**
     * OAuth token key/secret pair.
     */
    declare export interface Token {
        key: string;
        secret: string;
    }

    declare export default class OAuth {
        body_hash_function: typeof BodyHashFunction;
        consumer: Consumer;
        hash_function: typeof HashFunction;
        last_ampersand: boolean;
        nonce_length: number;
        parameter_seperator: string;
        realm?: string;
        signature_method: string;
        version: string;

        constructor(opts?: Options): OAuth;

        /**
         * Sign a request.
         */
        authorize(request: RequestOptions, token?: ?Token): Authorization;

        /**
         * Generate the oauth signature (i.e. oauth_signature).
         */
        getSignature(
            request: RequestOptions,
            token_secret?: string,
            oauth_data: Data,
        ): string;

        /**
         * Generate the body signature (i.e. oauth_body_hash).
         */
        getBodyHash(request: RequestOptions, token_secret?: string): string;

        /**
         * Encode the request attributes.
         *
         * Base String = "<Method>&<Base Url>&<ParameterString>"
         */
        getBaseString(request: RequestOptions, oauth_data: Data): string;

        /**
         * Encode the oauth data and the request parameter,
         */
        getParameterString(request: RequestOptions, oauth_data: Data): string;

        /**
         * Generate the signing key.
         *
         * Key = "<Consumer Key>&<Token Key or an empty string>"
         */
        getSigningKey(token_secret?: string): string;

        /**
         * Return the the URL without its querystring.
         */
        getBaseUrl(url: string): string;

        /**
         * Parse querystring / form data.
         */
        deParam(str: string): Param;

        /**
         * Parse querystring from an url
         */
        deParamUrl(url: string): Param;

        /**
         * Form data encoding.
         */
        percentEncode(str: string): string;

        /**
         * Convert OAuth authorization data to an http header.
         */
        toHeader(data: Authorization): Header;

        /**
         * Generate a random nonce.
         */
        getNonce(): string;

        /**
         * Generate a current timestamp in second.
         */
        getTimeStamp(): number;

        /**
         * Merge two object into a new one.
         */
        mergeObject<T, U>(obj1: T, obj2: U): T & U;

        /**
         * Sort an object properties by keys.
         */
        // NOTE (jeremy): Couldn't figure out the equivalent syntax in Flow yet!
        // sortObject<O extends {[k: string]: any}, K extends string>(obj: O): Array<{key: keyof O, value: O[K]}>;
    }
}

// These typings are based on the v4 types in flow-typed and updated
// using the TypeScript types in the project.
declare module '@react-native-community/netinfo' {
    declare export type UnknownStateType =
        // No network connection is active
        // Platforms: Android, iOS, Windows, Web
        | 'none'
        // The network state could not or has yet to be be determined
        // Platforms: Android, iOS, Windows, Web
        | 'unknown';

    declare export type CellularStateType =
        // Active network over cellular
        // Platforms: Android, iOS, Windows, Web
        'cellular';

    declare export type WifiStateType =
        // Active network over Wifi
        // Platforms: Android, iOS, Windows, Web
        'wifi';

    declare export type OtherStateType =
        // Active network over Bluetooth
        // Platforms: Android, Web
        | 'bluetooth'
        // Active network over wired ethernet
        // Platforms: Android, Windows, Web
        | 'ethernet'
        // Active network over WiMax
        // Platforms: Android, Web
        | 'wimax'
        // Active network over VPN
        // Platforms: Android
        | 'vpn'
        // Active network over another type of network
        // Platforms: Android, iOS, Windows, Web
        | 'other';

    declare export type CellularGeneration =
        | null //	Either we are not currently connected to a cellular network or type could not be determined
        | '2g' //	Currently connected to a 2G cellular network. Includes CDMA, EDGE, GPRS, and IDEN type connections
        | '3g' //	Currently connected to a 3G cellular network. Includes EHRPD, EVDO, HSPA, HSUPA, HSDPA, and UTMS type connections
        | '4g'; //	Currently connected to a 4G cellular network. Includes HSPAP and LTE type connections

    declare type StateType =
        | UnknownStateType
        | CellularStateType
        | WifiStateType
        | OtherStateType;

    declare type NetInfoStateDetailsWifi = {|
        // If the network connection is considered "expensive". This could be
        // in either energy or monetary terms. Platforms: Android, iOS,
        // Windows, Web
        +isConnectionExpensive: boolean,
        // The SSID of the network. May not be present, null, or an empty
        // string if it cannot be determined. On iOS, make sure your app
        // meets at least one of the following requirements. On Android, you
        // need to have the ACCESS_FINE_LOCATION permission in your
        // AndroidManifest.xml and accepted by the user.
        // Platforms: Android, iOS (not tvOS)
        +ssid: string,
        // An integer number from 0 to 5 for the signal strength. May not be
        // present if the signal strength cannot be determined.
        // Platforms: Android, iOS (not tvOS)
        +strength: number,
        // The external IP address. Can be in IPv4 or IPv6 format. May not be
        // present if it cannot be determined.
        // Platforms: Android, iOS
        +ipAddress: string,
        // The subnet mask in IPv4 format. May not be present if it cannot be
        // determined.
        // Platforms: Android, iOS
        +subnet: string,
    |};

    declare type NetInfoStateDetailsCellular = {|
        // If the network connection is considered "expensive". This could be
        // in either energy or monetary terms.
        // Platforms: Android, iOS, Windows, Web
        +isConnectionExpensive: boolean,
        // The generation of the cell network the user is connected to. This
        // can give an indication of speed, but no guarantees. Platforms:
        // Android, iOS,
        // Windows
        +cellularGeneration: CellularGeneration,
        // The network carrier name. May not be present or may be empty if
        // none can be determined.
        // Platforms:Android, iOS
        +carrier: string,
    |};

    declare type NetInfoStateDetailsOther = {|
        // If the network connection is considered "expensive". This could be
        // in either energy or monetary terms.
        // Platforms: Android, iOS, Windows, Web
        +isConnectionExpensive: boolean,
    |};

    declare export type NetInfoStateDescriptor<T, D> = $ReadOnly<{|
        // The type of the current connection.
        type: T,
        // If there is an active network connection. Note that this DOES NOT
        // mean that internet is reachable.
        isConnected: boolean,
        // If the internet is reachable with the currently active network
        // connection.
        isInternetReachable: boolean,
        // (Android only) Whether the device's WiFi is ON or OFF.
        isWifiEnabled: boolean,
        // The value depends on the type value. See below.
        details: D,
    |}>;

    declare export type NetInfoState =
        | NetInfoStateDescriptor<UnknownStateType, null>
        | NetInfoStateDescriptor<CellularStateType, NetInfoStateDetailsCellular>
        | NetInfoStateDescriptor<WifiStateType, NetInfoStateDetailsWifi>
        | NetInfoStateDescriptor<OtherStateType, NetInfoStateDetailsOther>;

    declare export type NetInfoConfiguration = {|
        // The URL to call to test if the internet is reachable. Only used on
        // platforms which do not supply internet reachability natively.
        reachabilityUrl: string,
        // A function which is passed the Response from calling the
        // reachability URL. It should return true if the response indicates
        // that the internet is reachable. Only used on platforms which do
        // not supply internet reachability natively.
        reachabilityTest: (response: Response) => boolean,
        // The number of milliseconds between internet reachability checks
        // when the internet was not previously detected. Only used on
        // platforms which do not supply internet reachability natively.
        reachabilityShortTimeout: number,
        // The number of milliseconds between internet reachability checks
        // when the internet was previously detected. Only used on platforms
        // which do not supply internet reachability natively.
        reachabilityLongTimeout: number,
        // The number of milliseconds that a reachability check is allowed to
        // take before failing. Only used on platforms which do not supply
        // internet reachability natively.
        reachabilityRequestTimeout: number,
    |};

    declare export var NetInfoStateType: $ReadOnly<{|
        none: 'none',
        unknown: 'unknown',
        cellular: 'cellular',
        wifi: 'wifi',
        bluetooth: 'bluetooth',
        ethernet: 'ethernet',
        wimax: 'wimax',
        vpn: 'vpn',
        other: 'other',
    |}>;

    declare export var NetInfoCellularGeneration: $ReadOnly<{|
        '2g': '2g',
        '3g': '3g',
        '4g': '4g',
    |}>;

    declare export type NetInfoStateCallback = (state: NetInfoState) => void;
    declare export type NetInfoSubscription = () => void;
    declare export var reportConnected: () => void;

    declare export default class NetInfo {
        static configure: (
            configuration: Partial<NetInfoConfiguration>,
        ) => void;
        static addEventListener: (NetInfoStateCallback) => NetInfoSubscription;
        static fetch: (iface?: StateType) => Promise<NetInfoState>;

        static useNetInfo: (
            configuration: NetInfoConfiguration,
        ) => NetInfoState;
    }
}
