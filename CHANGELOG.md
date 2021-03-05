# [5.12.0](https://github.com/jexia/jexia-sdk-js/compare/v5.11.0...v5.12.0) (2021-03-05)


### Features

* **rtc:** reconnect when connection got closed ([#205](https://github.com/jexia/jexia-sdk-js/issues/205)) ([1773ff5](https://github.com/jexia/jexia-sdk-js/commit/1773ff5a1fac2d04dc1a96783613eff956a44e1c))

# [5.11.0](https://github.com/jexia/jexia-sdk-js/compare/v5.10.3...v5.11.0) (2021-01-14)


### Bug Fixes

* **rtc:** open-close-open will fail to send new messages ([#204](https://github.com/jexia/jexia-sdk-js/issues/204)) ([7fedf94](https://github.com/jexia/jexia-sdk-js/commit/7fedf94b70e8b6e4f0c54d7d3174d209dff5b126))


### Features

* **dispatcher:** expose .on method to the client ([#203](https://github.com/jexia/jexia-sdk-js/issues/203)) ([d9a5c3e](https://github.com/jexia/jexia-sdk-js/commit/d9a5c3ee3a2a0b1791f4c99d83f2f5be7fe29fcd))

## [5.10.3](https://github.com/jexia/jexia-sdk-js/compare/v5.10.2...v5.10.3) (2021-01-12)


### Bug Fixes

* close RTC connection only on ums.signOut ([#202](https://github.com/jexia/jexia-sdk-js/issues/202)) ([9f97e01](https://github.com/jexia/jexia-sdk-js/commit/9f97e0124daa453d2c259be2e9c06299f7c38de2))

## [5.10.2](https://github.com/jexia/jexia-sdk-js/compare/v5.10.1...v5.10.2) (2021-01-06)


### Bug Fixes

* **rtc:** auto connect when there are tokens available ([#201](https://github.com/jexia/jexia-sdk-js/issues/201)) ([1d1a800](https://github.com/jexia/jexia-sdk-js/commit/1d1a8003b740bc290a8cda3eb1f5c7d23b192094))

## [5.10.1](https://github.com/jexia/jexia-sdk-js/compare/v5.10.0...v5.10.1) (2020-12-24)


### Bug Fixes

* **rtc:** when using the ums ([#200](https://github.com/jexia/jexia-sdk-js/issues/200)) ([a8d4812](https://github.com/jexia/jexia-sdk-js/commit/a8d4812c310a7b1597f4e598f3bbc50e9f7f6eae))

# [5.10.0](https://github.com/jexia/jexia-sdk-js/compare/v5.9.0...v5.10.0) (2020-12-17)


### Features

* **ums:** introduce switch user ([#198](https://github.com/jexia/jexia-sdk-js/issues/198)) ([0cb02d5](https://github.com/jexia/jexia-sdk-js/commit/0cb02d53562fc161abe3fba8b7d062b5954378b5))

# [5.9.0](https://github.com/jexia/jexia-sdk-js/compare/v5.8.0...v5.9.0) (2020-12-17)


### Features

* **ums:** introduce currentUser ([#197](https://github.com/jexia/jexia-sdk-js/issues/197)) ([db0d25d](https://github.com/jexia/jexia-sdk-js/commit/db0d25dac0f26c99e309db6e3e0f95edf3e5e084))

# [5.8.0](https://github.com/jexia/jexia-sdk-js/compare/v5.7.0...v5.8.0) (2020-12-15)


### Features

* **ums:** getUser can fallback on the default alias if set ([#196](https://github.com/jexia/jexia-sdk-js/issues/196)) ([650deec](https://github.com/jexia/jexia-sdk-js/commit/650deecf587de9d600595b1ad73ac92a4639b93d))

# [5.7.0](https://github.com/jexia/jexia-sdk-js/compare/v5.6.0...v5.7.0) (2020-12-15)


### Features

* **ums:** introduce isLoggedIn method ([#193](https://github.com/jexia/jexia-sdk-js/issues/193)) ([5b0a824](https://github.com/jexia/jexia-sdk-js/commit/5b0a824d782556b4d51199edcf2234233dbbc182))

# [5.6.0](https://github.com/jexia/jexia-sdk-js/compare/v5.5.0...v5.6.0) (2020-12-15)


### Features

* **ums:** introduce sign-out ([#192](https://github.com/jexia/jexia-sdk-js/issues/192)) ([febe179](https://github.com/jexia/jexia-sdk-js/commit/febe1791f1e2f1014f0db4afcad47004d92e5418))

# [5.5.0](https://github.com/jexia/jexia-sdk-js/compare/v5.4.2...v5.5.0) (2020-12-11)


### Features

* **token:** refresh token before a request made if digest fails ([#190](https://github.com/jexia/jexia-sdk-js/issues/190)) ([ef7e469](https://github.com/jexia/jexia-sdk-js/commit/ef7e469fb9b0e65898247186a9353da6963ffc51))

## [5.4.2](https://github.com/jexia/jexia-sdk-js/compare/v5.4.1...v5.4.2) (2020-12-10)


### Bug Fixes

* refresh url to be valid ([#189](https://github.com/jexia/jexia-sdk-js/issues/189)) ([8e4d075](https://github.com/jexia/jexia-sdk-js/commit/8e4d075024a335a95cca752c65dfdbca16b7ada4))
* **token:** restart timeout after digest ends ([#188](https://github.com/jexia/jexia-sdk-js/issues/188)) ([5f90972](https://github.com/jexia/jexia-sdk-js/commit/5f90972271c480fef1b1be5010b77cd31fd74b7c))

## [5.4.1](https://github.com/jexia/jexia-sdk-js/compare/v5.4.0...v5.4.1) (2020-12-09)


### Bug Fixes

* **token:** timeout for refreshing token based on expiration ([#187](https://github.com/jexia/jexia-sdk-js/issues/187)) ([ba6e23b](https://github.com/jexia/jexia-sdk-js/commit/ba6e23b908d02829ff71c6d384d67bd4f04a87a7))

# [5.4.0](https://github.com/jexia/jexia-sdk-js/compare/v5.3.4...v5.4.0) (2020-10-13)


### Features

* **ums:** add oauth support ([#183](https://github.com/jexia/jexia-sdk-js/issues/183)) ([5f17969](https://github.com/jexia/jexia-sdk-js/commit/5f17969cd2b2b03aa29435ddb1a4f9297b77d240))

## [5.3.4](https://github.com/jexia/jexia-sdk-js/compare/v5.3.3...v5.3.4) (2020-10-13)


### Bug Fixes

* **token-manager:** throw http status when it occurs ([#182](https://github.com/jexia/jexia-sdk-js/issues/182)) ([65a0d25](https://github.com/jexia/jexia-sdk-js/commit/65a0d25a72a7d07822075eea6bdf811a94f9392f)), closes [#180](https://github.com/jexia/jexia-sdk-js/issues/180)

## [5.3.3](https://github.com/jexia/jexia-sdk-js/compare/v5.3.2...v5.3.3) (2020-07-21)


### Bug Fixes

* **npm:** audit vulnerable packages ([#175](https://github.com/jexia/jexia-sdk-js/issues/175)) ([1cda1ea](https://github.com/jexia/jexia-sdk-js/commit/1cda1eaa0221219c6f533bac0821b7eea7b7b153))

## [5.3.2](https://github.com/jexia/jexia-sdk-js/compare/v5.3.1...v5.3.2) (2020-07-21)


### Bug Fixes

* **side-effects:** enable flag to fix external webpack changes ([#174](https://github.com/jexia/jexia-sdk-js/issues/174)) ([28261a2](https://github.com/jexia/jexia-sdk-js/commit/28261a22b06564b4f1b5934eb2bf4ef9fb21e094))

## [5.3.1](https://github.com/jexia/jexia-sdk-js/compare/v5.3.0...v5.3.1) (2020-07-06)


### Bug Fixes

* **node-ws:** warnings on versions of node higher than 10  ([#172](https://github.com/jexia/jexia-sdk-js/issues/172)) ([5409183](https://github.com/jexia/jexia-sdk-js/commit/5409183d7e56d9714840e34f688c85504bec632c))
* **rtc:** wrong url when using projectURL config param ([#173](https://github.com/jexia/jexia-sdk-js/issues/173)) ([b2faf98](https://github.com/jexia/jexia-sdk-js/commit/b2faf98703a2698b752f7e95b9f611a339b11cd4))

# [5.3.0](https://github.com/jexia/jexia-sdk-js/compare/v5.2.1...v5.3.0) (2020-06-18)


### Features

* **init:** add projectURL config parameter ([#171](https://github.com/jexia/jexia-sdk-js/issues/171)) ([27ee76f](https://github.com/jexia/jexia-sdk-js/commit/27ee76fe7f77a8a09af189f5d06b713258c5c38c))

## [5.2.1](https://github.com/jexia/jexia-sdk-js/compare/v5.2.0...v5.2.1) (2020-06-16)


### Bug Fixes

* **project-url:** enforce use of the new url throughout the modules ([#170](https://github.com/jexia/jexia-sdk-js/issues/170)) ([5091550](https://github.com/jexia/jexia-sdk-js/commit/5091550674b22444e24f5053d82acf9c65828cab))

# [5.2.0](https://github.com/jexia/jexia-sdk-js/compare/v5.1.0...v5.2.0) (2020-06-11)


### Features

* add project zone config to client initialization ([#150](https://github.com/jexia/jexia-sdk-js/issues/150)) ([2c85e9d](https://github.com/jexia/jexia-sdk-js/commit/2c85e9d866cd2953e769fe5dd61dd8e26ce68e20))

# [5.1.0](https://github.com/jexia/jexia-sdk-js/compare/v5.0.0...v5.1.0) (2020-06-08)


### Features

* **select-query:** add fields as a select query argument ([75b6baf](https://github.com/jexia/jexia-sdk-js/commit/75b6baf1d7b018ba5eddda5c40332d393bafe6c8))

# [5.0.0](https://github.com/jexia/jexia-sdk-js/compare/v4.10.2...v5.0.0) (2020-06-08)


### Bug Fixes

* **ums:** merge user credentials and extra fields for signup ([647daaa](https://github.com/jexia/jexia-sdk-js/commit/647daaa9415a8cb35a29f4c319c8a1adfc95a4b5))


### BREAKING CHANGES

* **ums:** (UMS)

## [4.10.2](https://github.com/jexia/jexia-sdk-js/compare/v4.10.1...v4.10.2) (2020-05-28)


### Bug Fixes

* **token manager:** change project init errors ([3adbd5a](https://github.com/jexia/jexia-sdk-js/commit/3adbd5a74e729af0c98d234ef6bb123f1fd687a1))

## [4.10.1](https://github.com/jexia/jexia-sdk-js/compare/v4.10.0...v4.10.1) (2020-05-20)


### Bug Fixes

* angular 9 compile issues ([2c6c2f3](https://github.com/jexia/jexia-sdk-js/commit/2c6c2f33944b3b2d9cc1017c0ed6d70e0a93fc63))

# [4.10.0](https://github.com/jexia/jexia-sdk-js/compare/v4.9.1...v4.10.0) (2020-04-26)


### Features

* **ums:** migrate UMS to rxJS ([b3b0374](https://github.com/jexia/jexia-sdk-js/commit/b3b0374200f2f00973303de134dea478af06b456))

## [4.9.1](https://github.com/jexia/jexia-sdk-js/compare/v4.9.0...v4.9.1) (2020-04-06)


### Bug Fixes

* **aggregation:** fix property name in aggregation object ([8a90d57](https://github.com/jexia/jexia-sdk-js/commit/8a90d5785ed2db0ad7912176a938f98fecab51c6))

# [4.9.0](https://github.com/jexia/jexia-sdk-js/compare/v4.8.1...v4.9.0) (2020-04-03)


### Features

* **query:** add alias support to query aggregation functions ([6229515](https://github.com/jexia/jexia-sdk-js/commit/6229515ed8b8aca539fc6b22e05c995f5d5faac9))

## [4.8.1](https://github.com/jexia/jexia-sdk-js/compare/v4.8.0...v4.8.1) (2020-03-26)


### Bug Fixes

* **filtering:** fix regexp operator ([bcbfa93](https://github.com/jexia/jexia-sdk-js/commit/bcbfa93fbaff978c2e2cd9ba761221626ff6fa39))

# [4.8.0](https://github.com/jexia/jexia-sdk-js/compare/v4.7.0...v4.8.0) (2020-03-05)


### Features

* **ums:** reset user's password ([#143](https://github.com/jexia/jexia-sdk-js/issues/143)) ([cf0e4a6](https://github.com/jexia/jexia-sdk-js/commit/cf0e4a6e73cb4e71d74cc6105877da388f927aea))

# [4.7.0](https://github.com/jexia/jexia-sdk-js/compare/v4.6.0...v4.7.0) (2020-02-17)


### Features

* **query:** add aggregation functions ([1a066f2](https://github.com/jexia/jexia-sdk-js/commit/1a066f2ba8bddad15a9da0f60a12d0cc9a85cc9c))

# [4.6.0](https://github.com/jexia/jexia-sdk-js/compare/v4.5.0...v4.6.0) (2020-02-13)


### Features

* **ums:** pass extra fields to sign-up ([2b9aca5](https://github.com/jexia/jexia-sdk-js/commit/2b9aca5e5d82c8f5c472bf649588934225d35b2f))

# [4.5.0](https://github.com/jexia/jexia-sdk-js/compare/v4.4.1...v4.5.0) (2020-01-31)


### Bug Fixes

* **ums:** disable insert operation ([#144](https://github.com/jexia/jexia-sdk-js/issues/144)) ([ef98caf](https://github.com/jexia/jexia-sdk-js/commit/ef98caf0d65fdc5ed3122634bff0e1f932d258dc))


### Features

* **ums:** crud methods ([#139](https://github.com/jexia/jexia-sdk-js/issues/139)) ([3959295](https://github.com/jexia/jexia-sdk-js/commit/3959295ffb8e152f23a5a2b9ca44932d31a57ab7))

## [4.4.1](https://github.com/jexia/jexia-sdk-js/compare/v4.4.0...v4.4.1) (2020-01-22)


### Bug Fixes

* **browser:** when calling global "process" an error is being thrown ([#142](https://github.com/jexia/jexia-sdk-js/issues/142)) ([87bb417](https://github.com/jexia/jexia-sdk-js/commit/87bb41779b7d824f60389bcb248665b5885578ed))

# [4.4.0](https://github.com/jexia/jexia-sdk-js/compare/v4.3.0...v4.4.0) (2019-12-23)


### Features

* **sets:** allow to initiate a list of resources at a time ([#135](https://github.com/jexia/jexia-sdk-js/issues/135)) ([556d9f9](https://github.com/jexia/jexia-sdk-js/commit/556d9f92a5037d537bede5ad1015b6fa556774dd))

# [4.3.0](https://github.com/jexia/jexia-sdk-js/compare/v4.2.4...v4.3.0) (2019-12-20)


### Features

* **queries:** migrate data queries to the observables ([#134](https://github.com/jexia/jexia-sdk-js/issues/134)) ([bd8143f](https://github.com/jexia/jexia-sdk-js/commit/bd8143f))

## [4.2.4](https://github.com/jexia/jexia-sdk-js/compare/v4.2.3...v4.2.4) (2019-11-29)


### Bug Fixes

* **ums:** throw an error if module initialized incorrectly ([#133](https://github.com/jexia/jexia-sdk-js/issues/133)) ([0887731](https://github.com/jexia/jexia-sdk-js/commit/0887731))

## [4.2.3](https://github.com/jexia/jexia-sdk-js/compare/v4.2.2...v4.2.3) (2019-10-18)


### Bug Fixes

* **request:** remake backend error format ([4f83058](https://github.com/jexia/jexia-sdk-js/commit/4f83058))

## [4.2.2](https://github.com/jexia/jexia-sdk-js/compare/v4.2.1...v4.2.2) (2019-10-09)


### Bug Fixes

* **ums:** allow fetching user by email ([194e1ae](https://github.com/jexia/jexia-sdk-js/commit/194e1ae))

## [4.2.1](https://github.com/jexia/jexia-sdk-js/compare/v4.2.0...v4.2.1) (2019-10-04)


### Bug Fixes

* **channels:** fix crashing after subscribing to the new channel ([8d14d35](https://github.com/jexia/jexia-sdk-js/commit/8d14d35))
* **typescript:** resolve types issue ([3af7df3](https://github.com/jexia/jexia-sdk-js/commit/3af7df3))

# [4.2.0](https://github.com/jexia/jexia-sdk-js/compare/v4.1.0...v4.2.0) (2019-09-27)


### Features

* **pub_sub:** communications with channels ([#122](https://github.com/jexia/jexia-sdk-js/issues/122)) ([a168c9e](https://github.com/jexia/jexia-sdk-js/commit/a168c9e))

# [4.1.0](https://github.com/jexia/jexia-sdk-js/compare/v4.0.0...v4.1.0) (2019-07-04)


### Features

* **relations:** add relations support ([#109](https://github.com/jexia/jexia-sdk-js/issues/109)) ([830559d](https://github.com/jexia/jexia-sdk-js/commit/830559d))

<a name="4.0.0"></a>
# [4.0.0](https://github.com/jexia/jexia-sdk-js/compare/v3.5.0...v4.0.0) (2019-06-03)


* Refactor BaseQuery and RequestExecutor (#61) ([ce41dde](https://github.com/jexia/jexia-sdk-js/commit/ce41dde)), closes [#61](https://github.com/jexia/jexia-sdk-js/issues/61)


### Bug Fixes

* **api:** change authorization schema ([58c83d2](https://github.com/jexia/jexia-sdk-js/commit/58c83d2))
* **auth:** change RTC auth point and token to access_token ([75c8c78](https://github.com/jexia/jexia-sdk-js/commit/75c8c78))
* **query:** remove record api ([12d657c](https://github.com/jexia/jexia-sdk-js/commit/12d657c))
* **realtime:** adapting real time module to the new module interface ([a6fe080](https://github.com/jexia/jexia-sdk-js/commit/a6fe080))
* **realtime:** fix issues after e2e testing ([5912e16](https://github.com/jexia/jexia-sdk-js/commit/5912e16))
* **request-executer:** remove body from GET/DELETE requests ([#70](https://github.com/jexia/jexia-sdk-js/issues/70)) ([ea8b510](https://github.com/jexia/jexia-sdk-js/commit/ea8b510))
* **rest:** insert records calls rest api ([e07fbcc](https://github.com/jexia/jexia-sdk-js/commit/e07fbcc))
* lint issues ([3eb2c53](https://github.com/jexia/jexia-sdk-js/commit/3eb2c53))
* remove mocked data ([637cf5c](https://github.com/jexia/jexia-sdk-js/commit/637cf5c))
* resoving merge conflicts ([3ec5fdd](https://github.com/jexia/jexia-sdk-js/commit/3ec5fdd))


### Features

* **auth:** change Auth API endpoints ([b1381e4](https://github.com/jexia/jexia-sdk-js/commit/b1381e4))
* **logger:** create logger module ([9c85f0d](https://github.com/jexia/jexia-sdk-js/commit/9c85f0d))
* **realtime:** new real time api to watch dataset events with observers ([8be37dc](https://github.com/jexia/jexia-sdk-js/commit/8be37dc))
* **record:** fetch all records ([861fd5b](https://github.com/jexia/jexia-sdk-js/commit/861fd5b))
* **ums:** specify user to the dataset request ([898b7f8](https://github.com/jexia/jexia-sdk-js/commit/898b7f8))
* **update-protocol:** using consumption ([9c1bb5a](https://github.com/jexia/jexia-sdk-js/commit/9c1bb5a))
* **update-protocol:** using consumption ([11a080b](https://github.com/jexia/jexia-sdk-js/commit/11a080b))
* **update-protocol:** using consumption ([0aad176](https://github.com/jexia/jexia-sdk-js/commit/0aad176))
* **update-protocol:** using consumption ([1288c87](https://github.com/jexia/jexia-sdk-js/commit/1288c87))


### BREAKING CHANGES

* Remove data property from Query and ICompiledQuery

* fix: review comments

<a name="3.5.0"></a>
# [3.5.0](https://github.com/jexia/jexia-sdk-js/compare/v3.4.0...v3.5.0) (2018-08-13)


### Features

* **query:** aggregation functions support ([38805bb](https://github.com/jexia/jexia-sdk-js/commit/38805bb)), closes [#28](https://github.com/jexia/jexia-sdk-js/issues/28)

<a name="3.4.0"></a>
# [3.4.0](https://github.com/jexia/jexia-sdk-js/compare/v3.3.1...v3.4.0) (2018-06-29)


### Features

* **filtering-condition:** allow any types for conditional methods ([ee1e01a](https://github.com/jexia/jexia-sdk-js/commit/ee1e01a))

<a name="3.3.1"></a>
## [3.3.1](https://github.com/jexia/jexia-sdk-js/compare/v3.3.0...v3.3.1) (2018-05-21)


### Bug Fixes

* **TokenManager:** fix refresh token time inconsistency when initializing ([3c97eb4](https://github.com/jexia/jexia-sdk-js/commit/3c97eb4))

<a name="3.3.0"></a>
# [3.3.0](https://github.com/jexia/jexia-sdk-js/compare/v3.2.7...v3.3.0) (2018-05-18)


### Features

* **array-fields:** overloads all methods that receive field names to accept array ([c23e5c8](https://github.com/jexia/jexia-sdk-js/commit/c23e5c8)), closes [#8](https://github.com/jexia/jexia-sdk-js/issues/8)

<a name="3.2.7"></a>
## [3.2.7](https://github.com/jexia/jexia-sdk-js/compare/v3.2.6...v3.2.7) (2018-05-16)


### Bug Fixes

* **SelectQuery:** adding generic tipe for relation filter ([84155e1](https://github.com/jexia/jexia-sdk-js/commit/84155e1))

<a name="3.2.6"></a>
## [3.2.6](https://github.com/jexia/jexia-sdk-js/compare/v3.2.5...v3.2.6) (2018-05-10)


### Bug Fixes

* **types:** exposing and correcting interface types ([eb3ed56](https://github.com/jexia/jexia-sdk-js/commit/eb3ed56))

<a name="3.2.5"></a>
## [3.2.5](https://github.com/jexia/jexia-sdk-js/compare/v3.2.4...v3.2.5) (2018-04-02)


### Bug Fixes

* **semantic-release:** update version at the packge.json file (3) ([6ce8b1d](https://github.com/jexia/jexia-sdk-js/commit/6ce8b1d))

<a name="3.2.2"></a>
## [3.2.2](https://github.com/jexia/jexia-sdk-js/compare/v3.2.1...v3.2.2) (2018-04-02)


### Bug Fixes

* **changelog:** fix changelog generation ([8dae3cc](https://github.com/jexia/jexia-sdk-js/commit/8dae3cc))
