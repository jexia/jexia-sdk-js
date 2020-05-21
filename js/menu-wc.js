'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">Jexia Javascript SDK</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="changelog.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CHANGELOG
                            </a>
                        </li>
                        <li class="link">
                            <a href="contributing.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CONTRIBUTING
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter additional">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#additional-pages"'
                            : 'data-target="#xs-additional-pages"' }>
                            <span class="icon ion-ios-book"></span>
                            <span>Guides</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="additional-pages"' : 'id="xs-additional-pages"' }>
                                    <li class="link ">
                                        <a href="additional-documentation/quick-start-guide.html" data-type="entity-link" data-context-id="additional">Quick Start Guide</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/typescript-features.html" data-type="entity-link" data-context-id="additional">TypeScript Features</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/code-of-conduct.html" data-type="entity-link" data-context-id="additional">Code of Conduct</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/dataset-operations.html" data-type="entity-link" data-context-id="additional">Dataset Operations</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/fileset-operations.html" data-type="entity-link" data-context-id="additional">Fileset Operations</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/user-management-system.html" data-type="entity-link" data-context-id="additional">User Management System</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/relations.html" data-type="entity-link" data-context-id="additional">Relations</a>
                                    </li>
                                    <li class="chapter inner">
                                        <a data-type="chapter-link" href="additional-documentation/real-time-operations.html" data-context-id="additional">
                                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#additional-page-6c50d82db73a9ba057cd4f74e6ae61ad"' : 'data-target="#xs-additional-page-6c50d82db73a9ba057cd4f74e6ae61ad"' }>
                                                <span class="link-name">Real Time Operations</span>
                                                <span class="icon ion-ios-arrow-down"></span>
                                            </div>
                                        </a>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="additional-page-6c50d82db73a9ba057cd4f74e6ae61ad"' : 'id="xs-additional-page-6c50d82db73a9ba057cd4f74e6ae61ad"' }>
                                            <li class="link for-chapter2">
                                                <a href="additional-documentation/real-time-operations/communication-with-channels.html" data-type="entity-link" data-context="sub-entity" data-context-id="additional">Communication with channels</a>
                                            </li>
                                        </ul>
                                    </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/ActionQuery.html" data-type="entity-link">ActionQuery</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseQuery.html" data-type="entity-link">BaseQuery</a>
                            </li>
                            <li class="link">
                                <a href="classes/Channel.html" data-type="entity-link">Channel</a>
                            </li>
                            <li class="link">
                                <a href="classes/Client.html" data-type="entity-link">Client</a>
                            </li>
                            <li class="link">
                                <a href="classes/DataOperationsModule.html" data-type="entity-link">DataOperationsModule</a>
                            </li>
                            <li class="link">
                                <a href="classes/DeleteQuery.html" data-type="entity-link">DeleteQuery</a>
                            </li>
                            <li class="link">
                                <a href="classes/FieldFilter.html" data-type="entity-link">FieldFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileOperationsModule.html" data-type="entity-link">FileOperationsModule</a>
                            </li>
                            <li class="link">
                                <a href="classes/FilterableQuery.html" data-type="entity-link">FilterableQuery</a>
                            </li>
                            <li class="link">
                                <a href="classes/InsertQuery.html" data-type="entity-link">InsertQuery</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoggerModule.html" data-type="entity-link">LoggerModule</a>
                            </li>
                            <li class="link">
                                <a href="classes/RealTimeModule.html" data-type="entity-link">RealTimeModule</a>
                            </li>
                            <li class="link">
                                <a href="classes/SelectQuery.html" data-type="entity-link">SelectQuery</a>
                            </li>
                            <li class="link">
                                <a href="classes/UMSModule.html" data-type="entity-link">UMSModule</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateQuery.html" data-type="entity-link">UpdateQuery</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/Dataset.html" data-type="entity-link">Dataset</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Fileset.html" data-type="entity-link">Fileset</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileUploader.html" data-type="entity-link">FileUploader</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Logger.html" data-type="entity-link">Logger</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/CommandError.html" data-type="entity-link">CommandError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IConsole.html" data-type="entity-link">IConsole</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFilteringCriterion.html" data-type="entity-link">IFilteringCriterion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFormData.html" data-type="entity-link">IFormData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IResource.html" data-type="entity-link">IResource</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUMSSignInOptions.html" data-type="entity-link">IUMSSignInOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IWebSocket.html" data-type="entity-link">IWebSocket</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/JwtRefreshArgument.html" data-type="entity-link">JwtRefreshArgument</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Modifier.html" data-type="entity-link">Modifier</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PublishArgument.html" data-type="entity-link">PublishArgument</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RealTimeCommand.html" data-type="entity-link">RealTimeCommand</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RealTimeCommandResponse.html" data-type="entity-link">RealTimeCommandResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RealTimeEventMessage.html" data-type="entity-link">RealTimeEventMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RealTimeMessage.html" data-type="entity-link">RealTimeMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RealTimeNotification.html" data-type="entity-link">RealTimeNotification</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RealTimeStoredMessage.html" data-type="entity-link">RealTimeStoredMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Resource.html" data-type="entity-link">Resource</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SubscriptionArgument.html" data-type="entity-link">SubscriptionArgument</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});