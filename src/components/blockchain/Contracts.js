/* eslint-disable no-undef */
import React from "react";
import {
  FormattedDate,
  FormattedNumber,
  FormattedTime,
  injectIntl
} from "react-intl";
import { connect } from "react-redux";
import { Client } from "../../services/api";
import { AddressLink } from "../common/Links";
import { Truncate } from "../common/text";
import TotalInfo from "../common/TableTotal";
import SmartTable from "../common/SmartTable.js";
import { TronLoader } from "../common/loaders";
import { upperFirst } from "lodash";
import { loadTokens } from "../../actions/tokens";
import xhr from "axios/index";
import { API_URL } from "../../constants";
import { TRXPrice } from "../common/Price";
import { ONE_TRX, IS_MAINNET } from "../../constants";
import { Tooltip,Table } from "antd";
import { QuestionMark } from "../common/QuestionMark.js";
import { tu } from "../../utils/i18n";
import { Link } from "react-router-dom";


function Nodetip({ props, val }) {
  let { intl } = props;
  return (
    <span>
      {val.isLibrary && (
        <img
          src={require("../../images/contract/book.png")}
          style={{ height: "16px" }}
        />
      )}

      {val.isSetting && (
        <Tooltip
          placement="top"
          title={intl.formatMessage({ id: "Optimization_Enabled" })}
        >
          <img
            src={require("../../images/contract/linghst.png")}
            style={{ height: "16px" }}
          />
        </Tooltip>
      )}

      {val.isParameter && (
        <Tooltip
          placement="top"
          title={intl.formatMessage({ id: "Constructor_Arguments_tip" })}
        >
          <img
            src={require("../../images/contract/tools.png")}
            style={{ height: "16px" }}
          />
        </Tooltip>
      )}

      {!val.isLibrary && !val.isSetting && !val.isParameter && "-"}
    </span>
  );
}
class Contracts extends React.Component {
  constructor() {
    super();

    this.state = {
      contracts: [],
      total: 0,
      rangeTotal: 0,
      loading: true,
      pagination: {
        showQuickJumper:true,
        position: 'both',
        showSizeChanger: true,
        defaultPageSize:20,
        total: 0
      }
    };
  }

  componentDidMount() {
    this.loadContracts();
  }

  componentDidUpdate() {
    // this.loadContracts();
  }

  search = () => {};

  loadContracts = async (page = 1, pageSize = 20) => {
    this.setState({ loading: true });
    await Client.getContracts({
      confirm: 0,
      limit: pageSize,
      start: (page - 1) * pageSize
    }).then(({ data, total, rangeTotal }) => {
      if (data) {
        this.setState({
          contracts: data,
          loading: false,
          total,
          rangeTotal,
          pagination: {
            ...this.state.pagination,
            total
          }
        });
      }
    });
  };

  customizedColumn = () => {
    let {intl} = this.props;
    const title = (
      <div>
        {upperFirst(intl.formatMessage({id: 'balance'}))}
        <span className="ml-2">
          <QuestionMark placement="top" text="voting_brokerage_tip" />
        </span>
      </div>
    )
    let column = [
      {
        title: upperFirst(intl.formatMessage({ id: "address" })),
        dataIndex: "address",
        key: "address",
        align: "left",
        className: "ant_table",
        width: "40%",
        render: (text, record, index) => {
          return (
            <Truncate>
              <AddressLink address={text} isContract={true}>
                {text}
              </AddressLink>
            </Truncate>
          );
        }
      },
      {
        title: upperFirst(
          intl.formatMessage({ id: "verifty_contract_result" })
        ),
        dataIndex: "verify_status",
        key: "verify_status",
        align: "left",
        className: "ant_table _text_nowrap",
        render: (text, record, index) => {
          return (
            <span>
              {text == 2 ? (
                <span>
                  <img
                    style={{ width: "20px", height: "20px" }}
                    src={require("../../images/contract/Verified.png")}
                  />
                  <span className="ml-1">
                    {" "}
                    {upperFirst(
                      intl.formatMessage({ id: "contract_verifty_passed" })
                    )}
                  </span>
                </span>
              ) : (
                <span>
                  <img
                    style={{ width: "20px", height: "20px" }}
                    src={require("../../images/contract/Unverified.png")}
                  />
                  <span
                    style={{ color: "rgb(216, 216, 216)" }}
                    className="ml-1"
                  >
                    {upperFirst(intl.formatMessage({ id: "unverifty_passed" }))}
                  </span>
                </span>
              )}
            </span>
          );
        }
      },
      {
        title: upperFirst(intl.formatMessage({ id: "ContractName" })),
        dataIndex: "name",
        key: "name",
        align: "left",
        className: "ant_table",
        render: (text, record, index) => {
          return <span>{text || "-"}</span>;
        }
      },
      // {
      //   title: upperFirst(intl.formatMessage({id: 'Compiler'})),
      //   dataIndex: 'Compiler',
      //   key: 'Compiler',
      //   align: 'left',
      //   render: (text, record, index) => {
      //     return <span>{text}</span>
      //   }
      // },
      {
        title: title,
        dataIndex: 'balance',
        key: 'balance',
        sorter: true,
        align: 'left',
        className: 'ant_table',
        render: (text, record, index) => {
          return (
            <TRXPrice
              amount={text || text == 0 ? parseInt(text) / ONE_TRX : 0}
            />
          );
        }
      },
      {
        title: upperFirst(intl.formatMessage({id: 'TxCount'})),
        dataIndex: 'trxCount',
        key: 'trxCount',
        sorter: true,
        align: 'right',
        className: 'ant_table',
        render: (text, record, index) => {
          return <FormattedNumber value={text} />;
        }
      }
      // {
      //   title: upperFirst(intl.formatMessage({id: 'Settings'})),
      //   dataIndex: 'isSetting',
      //   key: 'isSetting',
      //   align: 'left',
      //   width: '90px',
      //   className: 'ant_table',
      //   render: (text, record, index) => {
      //     return <Nodetip props={this.props} val={record}/>
      //   }
      // },
      // {
      //   title: upperFirst(intl.formatMessage({id: 'DateVerified'})),
      //   dataIndex: 'dateVerified',
      //   key: 'dateVerified',
      //   align: 'right',
      //   width: '170px',
      //   className: 'ant_table',
      //   render: (text, record, index) => {
      //     return <div>
      //             <FormattedDate value={text}/>{' '}
      //             <FormattedTime value={text}/>
      //           </div>
      //   }
      // }
    ];
    return column;
  };
  sunNetCustomizedColumn = () => {
        let {intl} = this.props;
        let column = [
            {
                title: upperFirst(intl.formatMessage({id: 'address'})),
                dataIndex: 'address',
                key: 'address',
                align: 'left',
                className: 'ant_table',
                width: '40%',
                render: (text, record, index) => {
                    return <Truncate>
                      <AddressLink address={text} isContract={true}>{text}</AddressLink>
                    </Truncate>
                }
            },
            {
                title: upperFirst(intl.formatMessage({id: 'ContractName'})),
                dataIndex: 'name',
                key: 'name',
                align: 'left',
                className: 'ant_table',
                render: (text, record, index) => {
                    return <span>{text || "-"}</span>
                }
            },
            // {
            //   title: upperFirst(intl.formatMessage({id: 'Compiler'})),
            //   dataIndex: 'Compiler',
            //   key: 'Compiler',
            //   align: 'left',
            //   render: (text, record, index) => {
            //     return <span>{text}</span>
            //   }
            // },
            {
                title: upperFirst(intl.formatMessage({id: 'balance'})),
                dataIndex: 'balance',
                key: 'balance',
                align: 'left',
                className: 'ant_table',
                render: (text, record, index) => {
                    return <TRXPrice amount={ (text || text== 0)? parseInt(text) / ONE_TRX : 0}/>
                }
            },
            {
                title: upperFirst(intl.formatMessage({id: 'TxCount'})),
                dataIndex: 'trxCount',
                key: 'trxCount',
                align: 'right',
                className: 'ant_table',
                render: (text, record, index) => {
                    return <FormattedNumber value={text}/>
                }
            },
            // {
            //   title: upperFirst(intl.formatMessage({id: 'Settings'})),
            //   dataIndex: 'isSetting',
            //   key: 'isSetting',
            //   align: 'left',
            //   width: '90px',
            //   className: 'ant_table',
            //   render: (text, record, index) => {
            //     return <Nodetip props={this.props} val={record}/>
            //   }
            // },
            // {
            //   title: upperFirst(intl.formatMessage({id: 'DateVerified'})),
            //   dataIndex: 'dateVerified',
            //   key: 'dateVerified',
            //   align: 'right',
            //   width: '170px',
            //   className: 'ant_table',
            //   render: (text, record, index) => {
            //     return <div>
            //             <FormattedDate value={text}/>{' '}
            //             <FormattedTime value={text}/>
            //           </div>
            //   }
            // }
        ];
        return column;
    }
  handleTableChange = (pagination, filters, sorter) =>{
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    pager.pageSize = pagination.pageSize;

    this.setState({
      pagination: pager
    }, () => this.loadContracts(pager.current, pager.pageSize));
  }
  render() {
    let { contracts, total, loading, rangeTotal,pagination } = this.state;
    let { match, intl } = this.props;
    let column = IS_MAINNET
      ? this.customizedColumn()
      : this.sunNetCustomizedColumn();
    let tableInfo =
      intl.formatMessage({ id: "view_total" }) +
      " " +
      total +
      " " +
      intl.formatMessage({ id: "contract_source_codes_found" });


    if (intl.locale === "ar") {
      tableInfo = total + "" + intl.formatMessage({ id: "contract_total" });
   }

    return (
      <main className="container header-overlap pb-3 token_black">
      {loading && <div className="loading-style"><TronLoader/></div>}
      <div className="row">
        <div className="col-md-12 table_pos">

          {total ? 
            
            <TotalInfo total={total} rangeTotal={rangeTotal} typeText="contract_source_codes_found" top="10px" isQuestionMark={false}/>
             : ''}
             {/**<div className="table_pos_info d-none d-md-block" style={{left: 'auto'}}>{tableInfo}<span> <QuestionMark placement="top" text="to_provide_a_better_experience"></QuestionMark></span></div> */}
           {/* <SmartTable bordered={true} loading={loading}
                      column={column} data={contracts} total={total}
                      onPageChange={(page, pageSize) => {
                        this.loadContracts(page, pageSize)
                      }}/> */}
            <Table
              bordered={true}
              columns={column}
              rowKey={(record, index) => {
                return index;
              }}
              dataSource={contracts}
              scroll={scroll}
              pagination={pagination}
              loading={loading}
              onChange={this.handleTableChange}
            />
        </div>
        </div>
        <p style={{textAlign:'right'}}>
          {tu("contract_source_code_title")}
          <Link to="/contracts/source-code-usage-terms">{tu("contract_source_code_use")}</Link>
        </p>
      </main>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

const mapDispatchToProps = {
  loadTokens
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Contracts));
