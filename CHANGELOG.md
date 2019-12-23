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
