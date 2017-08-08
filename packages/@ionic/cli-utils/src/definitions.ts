import * as crossSpawnType from 'cross-spawn';
import * as inquirerType from 'inquirer';
import * as superagentType from 'superagent';
import * as minimistType from 'minimist';

import { EventEmitter } from 'events';

export interface SuperAgentError extends Error {
  response: superagentType.Response;
}

export type LogFn = (msg: string | (() => string)) => void;
export type LogLevel = 'debug' | 'info' | 'ok' | 'warn' | 'error';

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string | (() => string);
  stream?: NodeJS.WritableStream;
}

export interface ILogger {
  level: LogLevel;
  prefix: string | (() => string);
  stream: NodeJS.WritableStream;

  debug: LogFn;
  info: LogFn;
  ok: LogFn;
  warn: LogFn;
  error: LogFn;
  msg: LogFn;
  nl(num?: number): void;
  shouldLog(level: LogLevel): boolean;
}

export interface ITask {
  msg: string;
  running: boolean;
  progressRatio: number;

  start(): this;
  progress(prog: number, total: number): this;
  clear(): this;
  succeed(): this;
  fail(): this;
  end(): this;
}

export interface ITaskChain {
  next(msg: string): ITask;
  updateMsg(msg: string): this;
  end(): this;
  fail(): this;
  cleanup(): this;
}

export interface PackageJson {
  name: string;
  version?: string;
  scripts?: { [key: string]: string };
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
  peerDependencies?: { [key: string]: string };
}

export interface BowerJson {
  name: string;
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
}

export interface ProjectFileProxy {
  proxyUrl: string;
  proxyNoAgent: boolean;
  rejectUnauthorized: boolean;
  path: string;
}

export type ProjectType = 'ionic-angular' | 'ionic1';

export interface ProjectIntegration {
  enabled?: boolean;
}

export interface ProjectIntegrationGulp extends ProjectIntegration {
  file?: string; // gulpfile.js location, because some people use Gulpfile.js
}

export interface ProjectFile {
  name: string;
  type: ProjectType;
  app_id: string;
  integrations: {
    cordova?: ProjectIntegration;
    gulp?: ProjectIntegrationGulp;
  };
  documentRoot?: string; // www folder location (TODO: use this everywhere)
  watchPatterns?: string[];
  proxies?: ProjectFileProxy[];
}

export interface Response<T> extends APIResponseSuccess {
  data: T;
}

export interface AppDetails {
  id: string;
  name: string;
  slug: string;
  repo_url?: string;
}

export interface AuthToken {
  token: string;
  details: {
    app_id: string;
    type: 'app-user';
    user_id: string;
  };
}

export interface SSHKey {
  id: string;
  pubkey: string;
  fingerprint: string;
  annotation: string;
  name: string;
  created: string;
  updated: string;
}

export interface DeploySnapshot {
  uuid: string;
  url: string;
}

export interface DeploySnapshotRequest extends DeploySnapshot {
  presigned_post: {
    url: string;
    fields: Object;
  };
}

export interface DeployChannel {
  uuid: string;
  tag: string;
}

export interface Deploy {
  uuid: string;
  snapshot: string;
  channel: string;
}

export interface PackageProjectRequest {
  id: number;
  presigned_post: {
    url: string;
    fields: Object;
  };
}

export interface PackageBuild {
  id: number;
  name: string | null;
  created: string;
  completed: string | null;
  platform: 'android' | 'ios';
  status: 'SUCCESS' | 'FAILED' | 'QUEUED' | 'BUILDING';
  mode: 'debug' | 'release';
  security_profile_tag: string | null;
  url?: string | null;
  output?: string | null;
}

export interface SecurityProfile {
  name: string;
  tag: string;
  type: 'development' | 'production';
  created: string;
  credentials: {
    android?: Object;
    ios?: Object;
  };
}

export interface IApp {
  load(app_id?: string): Promise<AppDetails>;
  list(): IPaginator<Response<AppDetails[]>>;
  create(app: { name: string; }): Promise<AppDetails>;
}

export interface IProject extends IConfig<ProjectFile> {
  directory: string;

  formatType(input: ProjectType): string;
  loadAppId(): Promise<string>;
  loadPackageJson(): Promise<PackageJson>;
  loadBowerJson(): Promise<BowerJson>;
}

export interface PackageVersions {
  [key: string]: string;
}

export interface DaemonFile {
  daemonVersion: string;
  latestVersions: {
    latest: PackageVersions;
    [key: string]: PackageVersions;
  };
}

export interface IDaemon extends IConfig<DaemonFile> {
  pidFilePath: string;
  logFilePath: string;
  getPid(): Promise<number | undefined>;
  setPid(pid: number): Promise<void>;
  populateDistTag(distTag: DistTag): void;
}

export type CommandLineInput = string | boolean | null | undefined | string[];
export type CommandLineInputs = string[];

export interface CommandLineOptions extends minimistType.ParsedArgs {
  [arg: string]: CommandLineInput;
}

export type CommandOptionType = StringConstructor | BooleanConstructor;
export type CommandOptionTypeDefaults = Map<CommandOptionType, CommandLineInput>;

export interface CommandOption {
  name: string;
  description: string;
  backends?: BackendFlag[];
  type?: CommandOptionType;
  default?: CommandLineInput;
  aliases?: string[];
  private?: boolean;
  intent?: string;
  visible?: boolean;
}

export interface NormalizedCommandOption extends CommandOption {
  type: CommandOptionType;
  default: CommandLineInput;
  aliases: string[];
}

export interface ExitCodeException extends Error {
  exitCode: number;
}

export type Validator = (input?: string, key?: string) => true | string;

export interface Validators {
  required: Validator;
  email: Validator;
  numeric: Validator;
}

export interface ValidationError {
  message: string;
  inputName: string;
}

export interface CommandInput {
  name: string;
  description: string;
  validators?: Validator[];
  required?: boolean;
  private?: boolean;
}

export interface NormalizedMinimistOpts extends minimistType.Opts {
  string: string[];
  boolean: string[];
  alias: { [key: string]: string[] };
  default: { [key: string]: CommandLineInput };
}

export type BackendFlag = 'pro' | 'legacy';

export interface CommandData {
  name: string;
  type: 'global' | 'project';
  backends?: BackendFlag[];
  description: string;
  longDescription?: string;
  exampleCommands?: string[];
  aliases?: string[];
  inputs?: CommandInput[];
  options?: CommandOption[];
  fullName?: string;
  visible?: boolean;
}

export interface HydratedCommandData extends CommandData {
  namespace: INamespace;
  aliases: string[];
  fullName: string;
}

export interface ISession {
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  isLoggedIn(): Promise<boolean>;
  getUserToken(): Promise<string>;
  getAppUserToken(app_id?: string): Promise<string>;
}

export interface IShellRunOptions extends crossSpawnType.SpawnOptions {
  showCommand?: boolean;
  showExecution?: boolean;
  showError?: boolean;
  fatalOnNotFound?: boolean;
  fatalOnError?: boolean;
  truncateErrorOutput?: number;
}

export interface IShell {
  run(command: string, args: string[], options: IShellRunOptions): Promise<string>;
}

export interface ITelemetry {
  sendCommand(command: string, args: string[]): Promise<void>;
  sendError(error: any, type: string): Promise<void>;
  resetToken(): Promise<void>;
}

export interface ConfigFile {
  lastCommand: string;
  daemon: {
    updates?: boolean;
  };
  urls: {
    api: string;
    dash: string;
  };
  git: {
    host: string;
    port?: number;
    setup?: boolean;
  };
  user: {
    id?: string;
    email?: string;
  };
  tokens: {
    user?: string;
    telemetry?: string;
    appUser: { [app_id: string]: string };
  };
  backend: BackendFlag;
  telemetry: boolean;
  yarn: boolean;
}

export interface IConfig<T extends { [key: string]: any }> {
  directory: string;
  fileName: string;
  filePath: string;

  load(options?: { disk?: boolean; }): Promise<T>;
  save(configFile?: T): Promise<void>;
}

export type APIResponse = APIResponseSuccess | APIResponseError;

export interface APIResponseMeta {
  status: number;
  version: string;
  request_id: string;
}

export type APIResponseData = Object | Object[] | string;

export interface APIResponseErrorDetails {
  error_type: string;
  parameter: string;
  errors: string[];
}

export interface APIResponseError {
  error: APIResponseErrorError;
  meta: APIResponseMeta;
}

export interface APIResponseErrorError {
  message: string;
  link: string | null;
  type: string;
  details?: APIResponseErrorDetails[];
}

export interface APIResponseSuccess {
  data: APIResponseData;
  meta: APIResponseMeta;
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'PURGE' | 'HEAD' | 'OPTIONS';

export interface IClient {
  host: string;

  make(method: HttpMethod, path: string): superagentType.SuperAgentRequest;
  do(req: superagentType.SuperAgentRequest): Promise<APIResponseSuccess>;
  paginate<T extends Response<Object[]>>(reqgen: () => superagentType.SuperAgentRequest, guard: (res: APIResponseSuccess) => res is T): IPaginator<T>;
}

export interface IPaginator<T extends Response<Object[]>> extends IterableIterator<Promise<T>> {}

export interface EnvironmentHookArgs {
  env: IonicEnvironment;
}

export interface InfoHookItem {
  type: 'system' | 'global-packages' | 'local-packages' | 'cli-packages';
  name: string;
  version: string;
  path?: string;
}

export interface ServeDetails {
  protocol: string;
  localAddress: string;
  externalAddress: string;
  port: number;

  /**
   * Whether or not the server is accessible locally.
   */
  locallyAccessible: boolean;

  /**
   * Whether or not the server is accessible externally.
   */
  externallyAccessible: boolean;

  [key: string]: any;
}

export interface CordovaProjectInfoHookResponse {
  id: string;
  name: string;
  version: string;
}

export interface IHook<T, U> {
  source: string;
  name: string;

  fire(args: T): Promise<U>;
}

export interface IHookEngine {
  fire(hook: 'info', args: EnvironmentHookArgs): Promise<InfoHookItem[]>;
  fire(hook: 'cordova:project:info', args: EnvironmentHookArgs): Promise<CordovaProjectInfoHookResponse[]>;
  fire(hook: 'plugins:init', args: EnvironmentHookArgs): Promise<void[]>;
  fire(hook: 'build:before', args: EnvironmentHookArgs): Promise<void[]>;
  fire(hook: 'build:after', args: EnvironmentHookArgs): Promise<void[]>;
  fire(hook: 'watch:before', args: EnvironmentHookArgs): Promise<void[]>;
  fire(hook: 'backend:changed', args: EnvironmentHookArgs): Promise<void[]>;

  register(source: string, hook: 'info', listener: (args: EnvironmentHookArgs) => Promise<InfoHookItem[]>): void;
  register(source: string, hook: 'cordova:project:info', listener: (args: EnvironmentHookArgs) => Promise<CordovaProjectInfoHookResponse>): void;
  register(source: string, hook: 'plugins:init', listener: (args: EnvironmentHookArgs) => Promise<void>): void;
  register(source: string, hook: 'build:before', listener: (args: EnvironmentHookArgs) => Promise<void>): void;
  register(source: string, hook: 'build:after', listener: (args: EnvironmentHookArgs) => Promise<void>): void;
  register(source: string, hook: 'watch:before', listener: (args: EnvironmentHookArgs) => Promise<void>): void;
  register(source: string, hook: 'backend:changed', listener: (args: EnvironmentHookArgs) => Promise<void>): void;

  getSources(hook: string): string[];
  hasSources(hook: string, sources: string[]): boolean;
  deleteSource(source: string): void;

  getRegistered<T, U>(hook: string): IHook<T, U>[];
}

export interface ICLIEventEmitter extends EventEmitter {
  on(event: 'watch:init', listener: () => void): this;
  on(event: 'watch:change', listener: (path: string) => void): this;

  emit(event: 'watch:init'): boolean;
  emit(event: 'watch:change', path: string): boolean;
}

export interface PromptQuestion extends inquirerType.Question {
  type: string; // type is required
  message: string; // message is required
  name: string; // name is required
}

export interface ConfirmPromptQuestion extends PromptQuestion {
  type: 'confirm';
  noninteractiveValue?: boolean;
}

export interface NonConfirmPromptQuestion extends PromptQuestion {
  type: 'input' | 'password' | 'list';
  noninteractiveValue?: string;
}

export interface PromptModule {
  (question: ConfirmPromptQuestion): Promise<boolean>;
  (question: NonConfirmPromptQuestion): Promise<string>;
}

export interface IonicEnvironment {
  readonly flags: IonicEnvironmentFlags;
  readonly hooks: IHookEngine;
  readonly client: IClient;
  readonly config: IConfig<ConfigFile>; // CLI global config (~/.ionic/config.json)
  readonly daemon: IDaemon;
  readonly events: ICLIEventEmitter;
  readonly log: ILogger;
  readonly prompt: PromptModule;
  readonly meta: IonicEnvironmentMeta;
  project: IProject; // project config (ionic.config.json)
  readonly plugins: IonicEnvironmentPlugins;
  session: ISession;
  readonly shell: IShell;
  readonly tasks: ITaskChain;
  readonly telemetry: ITelemetry;
  readonly namespace: IRootNamespace;

  open(): Promise<void>;
  close(): Promise<void>;
  runcmd(pargv: string[], opts?: { showExecution?: boolean; showLogs?: boolean; }): Promise<void>;
  load(modulePath: 'superagent'): typeof superagentType;
}

export interface IonicEnvironmentFlags {
  interactive: boolean;
  confirm: boolean;
}

export interface IonicEnvironmentMeta {
  cwd: string;
  local: boolean; // CLI running in local mode?
  binPath: string;
  libPath: string;
}

export interface IonicEnvironmentPlugins {
  ionic: Plugin;
  [key: string]: Plugin;
}

export type DistTag = 'local' | 'testing' | 'canary' | 'latest';

export interface PluginMeta {
  filePath: string;
}

export interface Plugin {
  name: string;
  version: string;
  registerHooks?(hooks: IHookEngine): void;
  meta?: PluginMeta; // set when loading plugin
}

export interface RootPlugin extends Plugin {
  namespace: IRootNamespace;
}

export interface HydratedPlugin extends Plugin {
  distTag: DistTag;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  meta: PluginMeta;
}

export interface INamespace {
  root: boolean;
  name: string;
  description: string;
  namespaces: INamespaceMap;
  commands: ICommandMap;

  locate(argv: string[]): Promise<[number, string[], ICommand | INamespace]>;
  getCommandMetadataList(): Promise<HydratedCommandData[]>;
}

export interface IRootNamespace extends INamespace {
  root: true;
  name: 'ionic';

  runCommand(env: IonicEnvironment, pargv: string[]): Promise<void | number>;
}

export interface ICommand {
  env: IonicEnvironment;
  metadata: CommandData;

  validate(inputs: CommandLineInputs): Promise<void>;
  run(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void | number>;
  execute(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void>;
}

export interface CommandPreRun extends ICommand {
  preRun(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void | number>;
}

export type NamespaceMapGetter = () => Promise<INamespace>;
export type CommandMapGetter = () => Promise<ICommand>;

export interface INamespaceMap extends Map<string, NamespaceMapGetter> {}

export interface ICommandMap extends Map<string, string | CommandMapGetter> {
  getAliases(): Map<string, string[]>;
  resolveAliases(cmdName: string): undefined | CommandMapGetter;
}

export interface ImageResource {
  platform: string;
  imageId: string | null;
  dest: string;
  resType: string;
  nodeName: string;
  nodeAttributes: string[];
  name: string;
  width: number;
  height: number;
  density?: string;
  orientation?: 'landscape' | 'portrait';
}

export interface ResourcesImageConfig {
  name: string;
  width: number;
  height: number;
  density?: string;
  orientation?: 'landscape' | 'portrait';
}

export interface SourceImage {
  ext: string;
  imageId?: string;
  cachedId?: string;
  platform: string;
  resType: string;
  path: string;
  vector: boolean;
  width: number;
  height: number;
}

export interface ImageUploadResponse {
  Error: string;
  Width: number;
  Height: number;
  Type: string;
  Vector: boolean;
}

export interface ResourcesPlatform {
  [imgType: string]: {
    images: ResourcesImageConfig[];
    nodeName: string;
    nodeAttributes: string[];
  };
}

export interface ResourcesConfig {
  [propName: string]: ResourcesPlatform;
}

export type KnownPlatform = 'ios' | 'android' | 'wp8';
export type KnownResourceType = 'icon' | 'splash';

export interface StarterTemplate {
  name: string;
  type: ProjectType;
  description: string;
  path: string;
  archive: string;
}

export interface StarterTemplateType {
  id: string;
  name: string;
  baseArchive: string;
  globalDependencies: string[];
  localDependencies: string[];
}
