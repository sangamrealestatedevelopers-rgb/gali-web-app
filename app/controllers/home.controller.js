const gamehostSeenModal = require("../models/gamehostSeen.model.js");
const User = require("../models/user.model.js");
const groupMSgModal = require("../models/groupMSg.model.js");
const comxMarketModel = require("../models/comxMarket.model.js");
const appControllerModal = require("../models/appController.model.js");
const resultTableModal = require("../models/resultTable.model.js");
const walletReportModal = require("../models/walletReport.model.js");
const usercoinModal = require("../models/usercoin.model.js");
const pointTableModal = require("../models/point_table.model.js");
const payment_settingModal = require("../models/payment_setting.model.js");
const user_withdrawModal = require("../models/user_withdraw.model.js");
const deduct_withrawModal = require("../models/deduct_withraw.model.js");
const redAccountList = require("../models/redAccountList.model.js");
const userTempModal = require("../models/userTemp.model.js");
const add_bank_account = require("../models/add_bank_account.model.js");
const imbOrderModal = require("../models/imbOrder.model.js");
const ResultWebsiteLinksModel = require("../models/ResultWebsiteLinks.model.js");
const moment = require("../js/moment.min.js");
const mongoose = require("mongoose");
var randomstring = require("randomstring");
const { MongoClient } = require("mongodb");
const axios = require("axios");
const querystring = require("querystring");

const Joi = require("joi");
const schema = Joi.object({
  user_id: Joi.string().required(),
});
const schemaHome = Joi.object({
  user_id: Joi.string().required(),
  app_id: Joi.string().required(),
  dev_id: Joi.string().required(),
});

const schemaTransfer = Joi.object({
  user_id: Joi.string().required(),
  devName: Joi.string().required(),
  rec_mob: Joi.string().required(),
  amount: Joi.number().required(),
  otp: Joi.required(),
});
const schemaSingleMarketResult = Joi.object({
  user_id: Joi.string().required(),
  app_id: Joi.string().required(),
  market_id: Joi.string().required(),
  type: Joi.string().required(),
});
const schemadeduct_user_balance = Joi.object({
  orderId: Joi.string().required(),
  orderAmount: Joi.number().required(),
  referenceId: Joi.string().required(),
  txStatus: Joi.string().required(),
  paymentMode: Joi.string().required(),
  txMsg: Joi.string().required(),
  upiID: Joi.string().required(),
  Token: Joi.string().required(),
  userID: Joi.string().required(),
  auth: Joi.string().required(),
  devName: Joi.string().required(),
  devType: Joi.string().required(),
  cod: Joi.string().required(),
  devId: Joi.string().required(),
});
const schemaapp_manager = Joi.object({
  user_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  app_id: Joi.string().required(),
});
const schemaadd_account = Joi.object({
  user_id: Joi.string().required(),
  ac_number: Joi.number().required(),
  ifsc: Joi.string().required(),
  account_holder: Joi.string().required(),
  bank_name: Joi.string().required(),
});
const schemaaddMsgGroup = Joi.object({
  user_id: Joi.string().required(),
  message: Joi.string().required(),
});

const schemadeduct_withdrawweb = Joi.object({
  user_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  account_number: Joi.required(),
  ifsc_code: Joi.string().required(),
  amount: Joi.number().required(),
  app_id: Joi.string().required(),
});
const schemadeduct_withdrawUpiweb = Joi.object({
  user_id: Joi.string().required(),
  dev_id: Joi.string().required(),
  upiid: Joi.required(),
  amount: Joi.number().required(),
  app_id: Joi.string().required(),
});
const schemaadd_bank_account = Joi.object({
  user_id: Joi.string().required(),
  bank_name: Joi.string().required(),
  otp: Joi.required(),
  account_holder: Joi.string().required(),
  account_number: Joi.required(),
  ifsc_code: Joi.string().required(),
  app_id: Joi.string().required(),
});
const schemaadd_all_bank_account = Joi.object({
  user_id: Joi.string().required(),
  app_id: Joi.string().required(),
});
const schemaadd_success_bank_account = Joi.object({
  user_id: Joi.string().required(),
  app_id: Joi.string().required(),
});
const schemaCreateImbOrder = Joi.object({
  user_id: Joi.string().required(),
  app_id: Joi.string().required(),
  amount: Joi.number().greater(0).required(),
  // user_token: Joi.string().required(),
  customer_mobile: Joi.string().allow("").optional(),
  order_id: Joi.string().allow("").optional(),
  redirect_url: Joi.string().allow("").optional(),
  remark1: Joi.string().allow("").optional(),
  remark2: Joi.string().allow("").optional(),
  webhook_url: Joi.string().allow("").optional(),
  devName: Joi.string().allow("").optional(),
  devType: Joi.string().allow("").optional(),
  devId: Joi.string().allow("").optional(),
});
const schemaImbOrderStatus = Joi.object({
  order_id: Joi.string().required(),
  // user_token: Joi.string().required(),
});

const IMB_BASE_URL = process.env.IMB_BASE_URL || "https://secure-stage.imb.org.in";
const IMB_CREATE_ORDER_PATH = "/api/create-order";
const IMB_CHECK_ORDER_PATH = "/api/check-order-status";
const IMB_USER_TOKEN = "7a7163ad52cc616002758a1e408a4a3b";
exports.resultLink = async (req, res) => {
  try {
    const data = await ResultWebsiteLinksModel.find({
      status: "1",
    });
    const rows = {
      success: 1,
      data: data,
      message: "Successfully",
    };
    res.status(200).send(rows);
    return;
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
exports.get_group_msg = async (req, res) => {
  try {
    const result = schema.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const currentDate = new Date();
      const date = currentDate.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      //  res.status(200).send({ message:date });
      //   return;
      let currentDatelastseen = moment();
      // currentDatelastseen.add(5, 'hours').add(30, 'minutes');
      let fromdates = currentDatelastseen.format("YYYY-MM-DD");
      const gamehostSeendata = await gamehostSeenModal.findOne({
        user_id: req.body.user_id,
        view_date: fromdates,
      });
      //  const count01 = await gamehostSeenModal.find().sort({ id: 'desc' }).limit(1).exec();
      //     if (count01.length>0) {
      //     var ids01 = count01[0].id + 1;
      //   } else {
      //     var ids01 = 1;
      //   }
      if (!gamehostSeendata) {
        const newBonus = new gamehostSeenModal({
          // id:ids01,
          view_date: fromdates,
          user_id: req.body.user_id,
        });
        newBonus.save();
      }
      const rows = {
        status: "1",
        data: [],
      };
      const gamehostSeendata11 = await groupMSgModal.find();
      gamehostSeendata11.forEach((marketData, i) => {
        const market = {
          message: marketData.toJSON().message,
          id: marketData.toJSON().id,
          name: marketData.toJSON().name,
          datetime: marketData.toJSON().created_at,
        };
        rows.data.push(market);
      });
      res.status(200).send({ message: rows });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
exports.home_list = async (req, res) => {
  try {

    const result = schemaHome.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const currentDate = new Date();
      const date = currentDate.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const user = await User.findOne({
        user_id: req.body.user_id,
        app_id: req.body.app_id,
      });
      if (user) {
        const comxMarket = await comxMarketModel
          .find({
            app_id: req.body.app_id,
            status: 1,
          })
          .sort({ market_position: +1 });

        const appController = await appControllerModal.findOne({
          app_id: req.body.app_id,
        });
        let currentDate = moment();

        // Add 5 hours and 30 minutes
        currentDate.add(5, "hours").add(30, "minutes");

        let currentDatelastseen = moment();
        // currentDatelastseen.add(5, 'hours').add(30, 'minutes');
        let formattedDateTimelastseen = currentDatelastseen.format(
          "YYYY-MM-DD hh:mm:ss A"
        );
        await User.updateOne(
          {
            user_id: req.body.user_id,
            // app_id: "com.babaji.galigame",
            app_id: "com.dubaiking",
          },

          {
            $set: {
              last_seen: currentDate,
              last_seen_date_time: formattedDateTimelastseen,
              created_at: currentDate,
              updated_at: currentDate,
            },
          }
        );

        if (comxMarket.length > 0) {
          const currentDate1 = new Date();
          // Format the date as 'DD-MM-YYYY'
          const currentdate = moment(currentDate1).format("DD-MM-YYYY");
          const sqlQuery = {
            date: currentdate,
          };
          const result = await resultTableModal
            .findOne(sqlQuery)
            .sort({ _id: -1 });

          if (result) {
            var lastUpdated_marketId = result.toJSON().market_id;
            var lastresult = result.toJSON().result;
            var date_time_result = result.toJSON().date_time_result;
            var comxMarketPerticulatMarket = await comxMarketModel.findOne({
              app_id: req.body.app_id,
              market_id: lastUpdated_marketId,
            });
            var market_name = comxMarketPerticulatMarket.toJSON().market_name;
          } else {
            var lastresult = "Result Not Available";
            var market_id = " Not Available";
            var market_name = " Not Available";
            var date_time_result = " Not Available";
          }
          const timestamp = Date.now();
          const formattedDate = moment(timestamp).format(
            "DD-MM-YYYY ddd hh:mm:ss A"
          );
          const usercredit = user.toJSON().credit + user.toJSON().win_amount;
          const currentMarketDetails = {
            whatsap: appController.toJSON().whatsapp,
            call: appController.toJSON().call_enable,
            tg_link: appController.toJSON().tg_link,
            fb_link: appController.toJSON().fb_link,
            playstore: appController.toJSON().playstore,
            whatsapnum: appController.toJSON().admin_contact_mob,
            other_game: appController.toJSON().other_game,
            market_name: market_name,
            market_id: lastUpdated_marketId,
            updated_time: date_time_result,
            market_result: lastresult,
          };
          const currentDatenew = new Date();
          // Format the date as 'DD-MM-YYYY'
          const currentdate11 = moment(currentDatenew).format("DD-MM-YYYY");
          const rows = {
            success: "1",
            message: "Home dashboard Fetch Successfully",
            nformat: formattedDate,
            user_balance: usercredit,
            is_kyc: user.toJSON().is_kyc,
            note: "👉👉🙏",
            marquee_msg: appController.toJSON().move_msg,
            current_market_details: "KGF Today Results",
            current_market_details: currentMarketDetails,
            current_date: currentdate11,
            data: [],
          };
          // if (appController.toJSON().is_paly_on_off == "1") {
          if (appController.toJSON().market_disable == "1") {
            for (var i = 0; i < comxMarket.length; i++) {
              var mid = comxMarket[i].toJSON().market_id;
              var market_id = comxMarket[i].toJSON().market_id;
              const currentDate1 = new Date();
              const currentdate = moment(currentDate1).format("DD-MM-YYYY");
              const sqlQuery = {
                market_id: market_id,
                date: currentdate,
              };
              const restdata = await resultTableModal.findOne({
                market_id: market_id,
                date: currentdate,
              });
              if (restdata != null) {
                var marketRes = restdata.toJSON().result;
                if (marketRes != "") {
                  var marketDetails = {
                    market_result: marketRes,
                  };
                } else {
                  var marketDetails = {
                    market_result: "XX",
                  };
                }
              } else {
                var marketDetails = {
                  market_result: "XX",
                };
              }
              const yesterday = moment().subtract(1, "days");
              const formattedYesterday = yesterday.format("DD-MM-YYYY");
              var market_id1 = comxMarket[i].toJSON().market_id;
              const restdata1 = await resultTableModal.findOne({
                market_id: market_id1,
                date: formattedYesterday,
              });
              if (restdata1 != null) {
                var premarketRes = restdata1.toJSON().result;
                if (premarketRes != "") {
                  marketDetails.market_result_previous_day = premarketRes;
                } else {
                  marketDetails.market_result_previous_day = "XX";
                }
              } else {
                marketDetails.market_result_previous_day = "XX";
              }
              var openTime = moment(
                comxMarket[i].toJSON().market_view_time_open,
                "HH:mm"
              ).format("h:mm A");
              var closeTime = moment(
                comxMarket[i].toJSON().market_sunday_time_close,
                "HH:mm"
              ).format("h:mm A");
              var resultTime = moment(
                comxMarket[i].toJSON().market_view_time_close,
                "HH:mm"
              ).format("h:mm A");
              marketDetails.market_name = comxMarket[i].toJSON().market_name;
              marketDetails.openTime = openTime;
              marketDetails.closeTime = resultTime;
              marketDetails.resultTime = closeTime;
              var mtime = comxMarket[i].toJSON().market_view_time_close;
              const time_in_24_hour_format = moment(mtime, "h:mm A").format(
                "HH:mm"
              );
              if (mid == "DISAWAR") {
                // const startRange = moment('02:40', 'HH:mm');
                const startRange = moment("00:30", "HH:mm");
                const endRange = moment("07:00", "HH:mm");
                const currentTime = moment(time_in_24_hour_format, "HH:mm");
                const isBetween = currentTime.isBetween(
                  startRange,
                  endRange,
                  null,
                  "[]"
                );
                if (isBetween) {
                  marketDetails.is_open = "1";
                } else {
                  marketDetails.is_open = "0";
                }
              } else if (mid == "SHIV ") {
                const startRange1 = moment("01:00", "HH:mm");
                const endRange1 = moment("09:00", "HH:mm");
                const currentTime1 = moment(time_in_24_hour_format, "HH:mm");
                const isBetween1 = currentTime1.isBetween(
                  startRange1,
                  endRange1,
                  null,
                  "[]"
                );
                if (isBetween1) {
                  marketDetails.is_open = "1";
                } else {
                  marketDetails.is_open = "0";
                }
              } else if (mid == "MAFIY") {
                const startRange11 = moment("02:45", "HH:mm");
                const endRange11 = moment("09:00", "HH:mm");
                const currentTime11 = moment(time_in_24_hour_format, "HH:mm");
                const isBetween11 = currentTime11.isBetween(
                  startRange11,
                  endRange11,
                  null,
                  "[]"
                );
                if (isBetween11) {
                  marketDetails.is_open = "1";
                } else {
                  marketDetails.is_open = "0";
                }
              } else if (mid == "KGFTIME") {
                const startRange11 = moment("00:30", "HH:mm");
                const endRange11 = moment("07:00", "HH:mm");
                const currentTime11 = moment(time_in_24_hour_format, "HH:mm");
                const isBetween11 = currentTime11.isBetween(
                  startRange11,
                  endRange11,
                  null,
                  "[]"
                );
                if (isBetween11) {
                  marketDetails.is_open = "1";
                } else {
                  marketDetails.is_open = "0";
                }
              } else {
                const timestamp21 = Date.now();
                const currentDateTime21 = new Date(timestamp21);
                const options = {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                };
                const current_time_second_24hours =
                  currentDateTime21.toLocaleTimeString("en-US", options);
                const timestamp31 = Date.now();
                const currentDateTime31 = new Date(timestamp31);
                const currentHour = currentDateTime31.getHours();
                if (
                  current_time_second_24hours < time_in_24_hour_format &&
                  currentHour > 6
                ) {
                  marketDetails.is_open = "1";
                } else {
                  marketDetails.is_open = "0";
                }
              }
              marketDetails.market_id = market_id;
              marketDetails.mini_bet = "5";
              marketDetails.max_bet = "200";
              marketDetails.betpoint_change_time = "100";
              rows.data.push(marketDetails);
            }
          }
          res.status(200).send(rows);
          return;
        } else {
          res
            .status(200)
            .send({ status: "0", message: "No Market Availavle For Play" });
          return;
        }
      } else {
        res.status(200).send({ status: "0", message: "User not Exits" });
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  } finally {
    //mongoose.connection.close();
  }
};

exports.transfer_store = async (req, res) => {
  try {
    const result = schemaTransfer.validate(req.body);
    if (result.error) {
      return res.status(200).json({ message: result.error.message });
    } else {
      //   if (["TMJADBZVFK", "APlISsZGTl", "BJWRZYDKSX", "EFZANSTXOP", "URYOWQTADS", "TIWUMVHECO"].includes(req.body.user_id)) {

      // } else {
      //   return;
      // }
      const currentDate = moment();
      // Format the date
      const currentdate = currentDate.format("DD-MM-YYYY");
      const currentdateTime = currentDate.format("DD-MM-YYYY HH:mm:ss");
      const userData = await User.findOne({
        user_id: req.body.user_id,
        mob: req.body.rec_mob,
      });
      if (userData) {
        return res
          .status(200)
          .send({ status: "0", message: "Same Account Not Transfer Amount" });
      }
      const userother = await User.findOne({
        mob: req.body.rec_mob,
      });
      var dates = "'" + currentdate + "'";
      if (userother) {
        const today = new Date(); // Current date
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1); // Subtract 1 day from current date
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Add 1 day to current date
        const walletReport = await walletReportModal.findOne({
          user_id: req.body.user_id,
          date: currentdate,
          tr_nature: "TRWITH003",
          type: "Debit",
          value_update_by: "Transfer",
        });
        // res.status(200).send({ status:'0',message:walletReport });
        if (walletReport) {
          return res.status(200).send({
            status: "0",
            message: "You can transfer Coin once in a day",
          });
        } else {
          var amount = req.body.amount;
          const appcontroller = await appControllerModal.findOne();
          var transfer_min = appcontroller.toJSON().transfer_min;
          var transfer_max = appcontroller.toJSON().transfer_max;
          if (
            amount >= parseInt(transfer_min) &&
            amount <= parseInt(transfer_max)
          ) {
            const user1 = await User.findOne({
              user_id: req.body.user_id,
              user_status: "1",
            });
            const userTemps = await userTempModal.findOne({
              mob: user1.mob,
              // otp: req.body.otp,
            });
            var reqiestid = await chkOtpViaUrl(userTemps.otp, req.body.otp);
            if (reqiestid == "Invalid otp") {
              return res.status(200).json({
                success: "3",
                message: "Invalid Otp",
              });
            }
            var rec_id = userother.toJSON().user_id;
            const userSelf = await User.findOne({
              user_id: req.body.user_id,
            });
            if (userSelf.toJSON().win_amount < amount) {
              return res
                .status(200)
                .send({ status: "0", message: "Amount is low" });
            }
            var newamount =
              parseInt(userSelf.toJSON().win_amount) - parseInt(amount);
            var newsenderCoin =
              userSelf.toJSON().win_amount + userSelf.toJSON().credit - amount;
            var smob = userSelf.toJSON().mob;
            var sfullname = userSelf.toJSON().FullName;
            var newcoins =
              parseInt(userother.toJSON().win_amount) + parseInt(amount);
            var ccoins =
              parseInt(userother.toJSON().win_amount) +
              parseInt(userother.toJSON().credit) +
              parseInt(amount);
            var devType = "";
            var tr_id =
              Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15);
            //  const count02 = await pointTableModal.find().sort({ id: 'desc' }).limit(1).exec();
            //     if (count02.length>0) {
            //       if (count02[0].id == undefined) {
            //         var ids02 = 1;
            //       }else{
            //         var ids02 = count02[0].id + 1;
            //       }
            //   } else {
            //     var ids02 = 1;
            //   }
            const pointstore1 = new pointTableModal({
              // id:ids02,
              app_id: "com.babaji.galigame",
              user_id: rec_id,
              transfer_user_id: req.body.user_id,
              transaction_id: tr_id,
              tr_nature: "TRDEPO002",
              tr_value: amount,
              tr_value_updated: ccoins,
              value_update_by: "Deposit",
              tr_value_type: "Credit",
              tr_device: req.body.devName,
              date: currentdate,
              date_time: currentdateTime,
              tr_remark: "transfer",
              tr_status: "Success",
              is_deleted: "0",
              device_type: devType,
              device_id: "",
              admin_key: "ADMIN0001",
              is_transfer: "1",
              t_mob: smob,
              transferByMob: smob,
              transferByName: sfullname,
              login_url: "babaclubs.in",
            });
            pointstore1.save();
            //  const count03 = await walletReportModal.find().sort({ id: 'desc' }).limit(1).exec();
            //   if (count03.length>0) {

            //   var ids03 = count03[0].id + 1;
            // } else {
            //   var ids03 = 1;
            // }
            const wallettore1 = new walletReportModal({
              // id:ids03,
              transaction_id: tr_id,
              value_update_by: "Transfer",
              is_transfer: "1",
              type: "Credit",
              user_id: rec_id,
              transfer_user_id: req.body.user_id,
              app_id: "com.babaji.galigame",
              tr_nature: "TRDEPO002",
              tr_value: amount,
              tr_value_updated: ccoins,
              date: currentdate,
              date_time: currentdateTime,
              tr_status: "Success",
              tr_remark: "From-" + smob,
              login_url: "babaclubs.in",
            });
            wallettore1.save();
            await User.updateOne(
              {
                user_id: rec_id,
                app_id: "com.babaji.galigame",
              },
              {
                $set: {
                  win_amount: newcoins,
                },
              }
            );
            //  const count04 = await pointTableModal.find().sort({ id: 'desc' }).limit(1).exec();
            //   if (count04.length>0) {
            //   var ids04 = count04[0].id + 1;
            // } else {
            //   var ids04 = 1;
            // }
            const pointstore11 = new pointTableModal({
              // id:ids04,
              app_id: "com.babaji.galigame",
              user_id: req.body.user_id,
              transfer_user_id: rec_id,
              transaction_id: tr_id,
              tr_nature: "TRWITH003",
              tr_value: amount,
              tr_value_updated: newsenderCoin,
              value_update_by: "Withdraw",
              tr_value_type: "Debit",
              tr_device: req.body.devName,
              date: currentdate,
              date_time: currentdateTime,
              tr_remark: "transfer",
              tr_status: "Success",
              is_deleted: "0",
              device_type: devType,
              device_id: "",
              admin_key: "ADMIN0001",
              is_transfer: "1",
              t_mob: req.body.rec_mob,
              login_url: "babaclubs.in",
            });
            pointstore11.save();
            //  const count05 = await walletReportModal.find().sort({ id: 'desc' }).limit(1).exec();
            //   if (count05.length>0) {
            //   var ids05 = count05[0].id + 1;
            // } else {
            //   var ids05 = 1;
            // }
            const wallettore11 = new walletReportModal({
              // id:ids05,
              transaction_id: tr_id,
              value_update_by: "Transfer",
              is_transfer: "1",
              type: "Debit",
              user_id: req.body.user_id,
              transfer_user_id: rec_id,
              app_id: "com.babaji.galigame",
              tr_nature: "TRWITH003",
              tr_value: amount,
              tr_value_updated: newsenderCoin,
              date: currentdate,
              date_time: currentdateTime,
              tr_status: "Success",
              tr_remark: "To-" + req.body.rec_mob,
              login_url: "babaclubs.in",
            });
            wallettore11.save();
            await User.updateOne(
              {
                user_id: req.body.user_id,
                app_id: "com.babaji.galigame",
              },
              {
                $set: {
                  win_amount: newamount,
                },
              }
            );
            return res.status(200).send({
              status: "1",
              message: "Amount has been transferred successfully",
            });
          } else {
            return res.status(200).send({
              status: "0",
              message:
                "You can transfer Minimum " +
                transfer_min +
                " and Maximum " +
                transfer_max,
            });
          }
        }
      } else {
        return res
          .status(200)
          .send({ status: "0", message: "Receiver account does not exists" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};
exports.single_market_result = async (req, res) => {
  try {
    const result = schemaSingleMarketResult.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const user = await User.findOne({
        user_id: req.body.user_id,
        app_id: req.body.app_id,
      });
      if (user) {
        const comxMarket = await comxMarketModel.findOne({
          market_id: req.body.market_id,
          app_id: req.body.app_id,
        });
        if (comxMarket) {
          const rows = {
            success: "1",
            message: "Successfully Markets Fetched",
            data: [],
          };
          var type = req.body.type;
          if (type == "1") {
            const sqlQuery = {
              market_id: req.body.market_id,
              app_id: req.body.app_id,
            };
            var resultTable = await resultTableModal
              .find(sqlQuery)
              .sort({ _id: -1 })
              .limit(50);
          } else if (type == "2") {
            var from = req.body.from;
            var to = req.body.to;

            if (from != "" || to == "") {
              const sqlQuery = {
                market_id: req.body.market_id,
                app_id: req.body.app_id,
                date: from,
              };
              var resultTable = await resultTableModal
                .find(sqlQuery)
                .sort({ _id: -1 });
            }
            if (from != "" && to != "to") {
              const sqlQuery = {
                market_id: req.body.market_id,
                app_id: req.body.app_id,
                date: { $gte: from, $lte: to },
              };
              var resultTable = await resultTableModal
                .find(sqlQuery)
                .sort({ _id: -1 });
            }
          }
          resultTable.forEach((resulttabl, i) => {
            const market = {
              result: resulttabl.toJSON().result,
              date: resulttabl.toJSON().date,
            };
            rows.data.push(market);
          });
          res.status(200).send(rows);
          return;
        } else {
          res
            .status(200)
            .send({ status: "0", message: "No Chart Result Found" });
          return;
        }
      } else {
        res
          .status(200)
          .send({ status: "0", message: "User Not Available Or Blocked" });
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

// exports.deduct_user_balance = async (req, res) => {
//   try {
//     const result = schemadeduct_user_balance.validate(req.body);
//     if (result.error) {
//       res.status(200).json({ message: result.error.message });
//     } else {
//       const user = await User.findOne({
//         user_id: req.body.userID,
//         app_id: req.body.Token,
//       });
//       if (user) {
//         var cod = req.body.cod;
//         var userBal = user.toJSON().credit;
//         if (cod == "SUCCESS") {
//           var UpdatedBalance =
//             parseInt(userBal) + parseInt(req.body.orderAmount);
//           const appController = await appControllerModal.findOne();
//           const currentDate = moment();
//           const currentdate = currentDate.format("DD-MM-YYYY");
//           const currentdateTime = currentDate.format("DD-MM-YYYY HH:mm:ss");
//           //  const count06 = await pointTableModal.find().sort({ id: 'desc' }).limit(1).exec();
//           //       if (count06.length>0) {
//           //       var ids06 = count06[0].id + 1;
//           //     } else {
//           //       var ids06 = 1;
//           //     }
//           const pointstore11 = new pointTableModal({
//             // id:ids06,
//             app_id: req.body.Token,
//             user_id: req.body.userID,
//             transaction_id: req.body.referenceId,
//             tr_nature: "TRDEPO002",
//             tr_value: req.body.orderAmount,
//             tr_value_updated: UpdatedBalance,
//             value_update_by: "Deposit",
//             tr_value_type: "Credit",
//             tr_device: req.body.devName,
//             date: currentdate,
//             date_time: currentdateTime,
//             tr_remark: "Online",
//             tr_status: "Pending",
//             is_deleted: "0",
//             device_type: req.body.devType,
//             device_id: req.body.devId,
//             admin_key: "ADMIN0001",
//             upi_id: appController.toJSON().upiId,
//           });
//           pointstore11.save();
//           //  const count07 = await walletReportModal.find().sort({ id: 'desc' }).limit(1).exec();
//           //       if (count07.length>0) {

//           //       var ids07 = count07[0].id + 1;
//           //     } else {
//           //       var ids07 = 1;
//           //     }
//           const wallettore11 = new walletReportModal({
//             // id:ids07,
//             type: "Credit",
//             transaction_id: req.body.referenceId,
//             value_update_by: "Deposit",
//             user_id: req.body.user_id,
//             app_id: req.body.Token,
//             tr_nature: "TRDEPO002",
//             tr_value: req.body.orderAmount,
//             tr_value_updated: UpdatedBalance,
//             date: currentdate,
//             date_time: currentdateTime,
//             tr_status: "Pending",
//             tr_remark: "Online",
//           });
//           wallettore11.save();
//           res.status(200).send({ status: "1", message: req.body.txMsg });
//         } else {
//           const currentDate = moment();
//           // Format the date
//           const currentdate = currentDate.format("DD-MM-YYYY");
//           const currentdateTime = currentDate.format("DD-MM-YYYY HH:mm:ss");
//           //  const count08 = await usercoinModal.find().sort({ id: 'desc' }).limit(1).exec();
//           //       if (count08.length>0) {
//           //       var ids08 = count08[0].id + 1;
//           //     } else {
//           //       var ids08 = 1;
//           //     }
//           const usercoin = new usercoinModal({
//             // id:ids08,
//             user_id: req.body.user_id,
//             money: req.body.orderAmount,
//             transStatus: req.body.txStatus,
//             upiId: req.body.upiID,
//             TranID: req.body.orderId,
//             TDate: currentdateTime,
//           });
//           usercoin.save();
//           res.status(200).send({ status: "2", message: req.body.txMsg });
//           return;
//         }
//       } else {
//         res
//           .status(200)
//           .send({ status: "0", message: "User Not Available Or Blocked" });
//         return;
//       }
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//     return;
//   }
// };
const getRequestBaseUrl = (req) => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = forwardedProto
    ? String(forwardedProto).split(",")[0]
    : req.protocol;
  return `${protocol}://${req.get("host")}`;
};

const getProviderOrderStatus = (data = {}) => {
  return (
    data?.status_text ||
    data?.order_status ||
    data?.payment_status ||
    data?.data?.status ||
    data?.data?.order_status ||
    data?.result?.status ||
    data?.status ||
    ""
  );
};

const isProviderSuccessStatus = (statusValue) => {
  const normalizedStatus = String(statusValue || "").trim().toUpperCase();
  return [
    "SUCCESS",
    "SUCCESSFUL",
    "COMPLETED",
    "PAID",
    "CAPTURED",
    "TRUE",
    "1",
  ].includes(normalizedStatus);
};

const createDepositLedgerEntry = async ({
  appId,
  userId,
  userCredit,
  orderAmount,
  referenceId,
  devName,
  devType,
  devId,
  txMsg,
  remark,
  paymentMode,
  upiId,
}) => {
  const existingDeposit = await pointTableModal.findOne({
    app_id: appId,
    user_id: userId,
    tr_nature: "TRDEPO002",
    transaction_id: referenceId,
  });
  if (existingDeposit) {
    return {
      alreadyProcessed: true,
      updatedBalance: existingDeposit.tr_value_updated,
    };
  }

  const updatedBalance = parseInt(userCredit || 0) + parseInt(orderAmount || 0);
  const appController = await appControllerModal.findOne({ app_id: appId });
  const fallbackAppController =
    appController || (await appControllerModal.findOne());
  const now = moment();
  const currentdate = now.format("DD-MM-YYYY");
  const currentdateTime = now.format("DD-MM-YYYY HH:mm:ss");

  const pointstore11 = new pointTableModal({
    app_id: appId,
    user_id: userId,
    transaction_id: referenceId,
    tr_nature: "TRDEPO002",
    tr_value: orderAmount,
    tr_value_updated: updatedBalance,
    value_update_by: "Deposit",
    tr_value_type: "Credit",
    tr_device: devName || "WEB",
    date: currentdate,
    date_time: currentdateTime,
    tr_remark: remark || "Online",
    tr_status: "Pending",
    is_deleted: "0",
    device_type: devType || "web",
    device_id: devId || "WEB",
    admin_key: "ADMIN0001",
    upi_id: fallbackAppController ? fallbackAppController.toJSON().upiId : null,
  });

  const wallettore11 = new walletReportModal({
    type: "Credit",
    transaction_id: referenceId,
    value_update_by: "Deposit",
    user_id: userId,
    app_id: appId,
    tr_nature: "TRDEPO002",
    tr_value: orderAmount,
    tr_value_updated: updatedBalance,
    date: currentdate,
    date_time: currentdateTime,
    tr_status: "Pending",
    tr_remark: remark || "Online",
  });

  await pointstore11.save();
  await wallettore11.save();

  return {
    alreadyProcessed: false,
    updatedBalance,
    message: txMsg || "Deposit request created.",
    paymentMode: paymentMode || "Online",
    upiId: upiId || null,
  };
};

const syncImbOrderFromProvider = async ({
  orderDoc,
  reqBody = {},
  payloadSnapshot = null,
}) => {
  const orderId = String(orderDoc.order_id || "");
  const userToken = orderDoc.user_token;
  if (!orderId || !userToken) {
    await imbOrderModal.updateOne(
      { _id: orderDoc._id },
      {
        $set: {
          status: "PENDING",
          payment_status: "TOKEN_MISSING",
          last_response: payloadSnapshot || reqBody || null,
          updated_at: new Date(),
        },
      }
    );
    return {
      order_id: orderId || null,
      status: "TOKEN_MISSING",
      is_success: false,
      ledger_message: null,
    };
  }

  const providerResponse = await axios.post(
    `${IMB_BASE_URL}${IMB_CHECK_ORDER_PATH}`,
    querystring.stringify({
      user_token: userToken,
      order_id: orderId,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      timeout: 20000,
    }
  );

  const responseData = providerResponse?.data || {};
  const providerStatus = getProviderOrderStatus(responseData);
  const isSuccess = isProviderSuccessStatus(providerStatus);
  const refId =
    responseData?.referenceId ||
    responseData?.transaction_id ||
    responseData?.txn_id ||
    orderDoc.reference_id ||
    orderId;

  await imbOrderModal.updateOne(
    { _id: orderDoc._id },
    {
      $set: {
        payment_status: String(providerStatus || "UNKNOWN"),
        status: isSuccess ? "PAID" : "PENDING",
        reference_id: refId,
        last_response: payloadSnapshot || responseData,
        updated_at: new Date(),
      },
    }
  );

  let ledgerMessage = null;
  if (isSuccess) {
    const user = await User.findOne({
      user_id: orderDoc.user_id,
      app_id: orderDoc.app_id,
    });
    if (user) {
      const ledger = await createDepositLedgerEntry({
        appId: orderDoc.app_id,
        userId: orderDoc.user_id,
        userCredit: user.toJSON().credit,
        orderAmount: Number(orderDoc.amount),
        referenceId: refId,
        devName: reqBody.devName || "WEB",
        devType: reqBody.devType || "web",
        devId: reqBody.devId || "WEB",
        txMsg: responseData?.message || "Payment verified.",
        remark: "IMB",
        paymentMode: responseData?.payment_mode || "Online",
        upiId: responseData?.upiID || responseData?.upi_id || null,
      });
      ledgerMessage = ledger.alreadyProcessed
        ? "Transaction already processed."
        : "Deposit entry created.";
    }
  }

  return {
    order_id: orderId,
    status: providerStatus || "UNKNOWN",
    is_success: isSuccess,
    ledger_message: ledgerMessage,
    provider_data: responseData,
  };
};

exports.deduct_user_balance = async (req, res) => {
  try {
    const result = schemadeduct_user_balance.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    }

    const userId = req.body.userID;
    const appId = req.body.Token;
    const user = await User.findOne({
      user_id: userId,
      app_id: appId,
    });

    if (!user) {
      res
        .status(200)
        .send({ status: "0", message: "User Not Available Or Blocked" });
      return;
    }

    if (String(req.body.cod).toUpperCase() === "SUCCESS") {
      const ledger = await createDepositLedgerEntry({
        appId,
        userId,
        userCredit: user.toJSON().credit,
        orderAmount: req.body.orderAmount,
        referenceId: req.body.referenceId || req.body.orderId,
        devName: req.body.devName,
        devType: req.body.devType,
        devId: req.body.devId,
        txMsg: req.body.txMsg,
        remark: "Online",
        paymentMode: req.body.paymentMode,
        upiId: req.body.upiID,
      });

      res.status(200).send({
        status: "1",
        message: ledger.alreadyProcessed
          ? "Transaction already processed."
          : req.body.txMsg,
      });
      return;
    }

    const currentdateTime = moment().format("DD-MM-YYYY HH:mm:ss");
    const usercoin = new usercoinModal({
      user_id: userId,
      money: req.body.orderAmount,
      transStatus: req.body.txStatus,
      upiId: req.body.upiID,
      TranID: req.body.orderId,
      TDate: currentdateTime,
    });
    await usercoin.save();
    res.status(200).send({ status: "2", message: req.body.txMsg });
    return;
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

exports.create_imb_order = async (req, res) => {
  try {
    const validation = schemaCreateImbOrder.validate(req.body);
    if (validation.error) {
      return res.status(400).json({ success: "0", message: validation.error.message });
    }

    const user = await User.findOne({
      user_id: req.body.user_id,
      app_id: req.body.app_id,
      user_status: { $in: [1, "1"] },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: "0", message: "User Not Available Or Blocked" });
    }

    const generatedOrderId =
      req.body.order_id || `${String(req.body.user_id)}${Date.now()}`;
    const webhookUrl =
      req.body.webhook_url || `${getRequestBaseUrl(req)}/imb-api/api/webhook`;
    const payload = {
      customer_mobile:
        req.body.customer_mobile || String(user.toJSON().mob || ""),
      user_token: IMB_USER_TOKEN,
      amount: String(req.body.amount),
      order_id: generatedOrderId,
      redirect_url: req.body.redirect_url || "",
      remark1: req.body.remark1 || "",
      remark2: req.body.remark2 || "",
      webhook_url: webhookUrl,
    };

    const response = await axios.post(
      `${IMB_BASE_URL}${IMB_CREATE_ORDER_PATH}`,
      querystring.stringify(payload),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        timeout: 20000,
      }
    );

    const responseData = response?.data || {};
    const providerStatus = getProviderOrderStatus(responseData) || "CREATED";
    const paymentUrl =
      responseData?.payment_url ||
      responseData?.payment_link ||
      responseData?.pay_url ||
      responseData?.url ||
      responseData?.redirect_url ||
      null;

    await imbOrderModal.findOneAndUpdate(
      { order_id: generatedOrderId },
      {
        $set: {
          order_id: generatedOrderId,
          user_id: req.body.user_id,
          app_id: req.body.app_id,
          amount: Number(req.body.amount),
          user_token: IMB_USER_TOKEN,
          status: "CREATED",
          payment_status: String(providerStatus),
          payment_url: paymentUrl,
          webhook_url: webhookUrl,
          last_response: responseData,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: "1",
      message: responseData?.message || "Order created successfully.",
      order_id: generatedOrderId,
      webhook_url: webhookUrl,
      ...responseData,
    });
  } catch (error) {
    const providerMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to create payment order.";
    return res.status(502).json({
      success: "0",
      message: providerMessage,
      provider_response: error?.response?.data || null,
    });
  }
};

exports.check_imb_order_status = async (req, res) => {
  try {
    const validation = schemaImbOrderStatus.validate(req.body);
    if (validation.error) {
      return res.status(400).json({ success: "0", message: validation.error.message });
    }

    const localOrder = await imbOrderModal.findOne({ order_id: req.body.order_id });
    const payload = {
      user_token: IMB_USER_TOKEN,
      order_id: req.body.order_id,
    };

    const response = await axios.post(
      `${IMB_BASE_URL}${IMB_CHECK_ORDER_PATH}`,
      querystring.stringify(payload),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        timeout: 20000,
      }
    );

    const responseData = response?.data || {};
    const providerStatus = getProviderOrderStatus(responseData);
    const isSuccess = isProviderSuccessStatus(providerStatus);

    if (localOrder) {
      const syncResult = await syncImbOrderFromProvider({
        orderDoc: localOrder,
        reqBody: req.body,
      });
      return res.status(200).json({
        success: "1",
        message: responseData?.message || "Status fetched",
        order_id: req.body.order_id,
        status: syncResult.status,
        is_success: syncResult.is_success,
        ledger_message: syncResult.ledger_message,
        data: responseData,
      });
    }

    return res.status(200).json({
      success: "1",
      message: responseData?.message || "Status fetched",
      order_id: req.body.order_id,
      status: providerStatus || "UNKNOWN",
      is_success: isSuccess,
      ledger_message: null,
      data: responseData,
    });
  } catch (error) {
    const providerMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to check order status.";
    return res.status(502).json({
      success: "0",
      message: providerMessage,
      provider_response: error?.response?.data || null,
    });
  }
};

exports.imb_payment_webhook = async (req, res) => {
  try {
    const payload = req.body || {};
    const orderId = payload.order_id || payload.orderId;
    if (orderId) {
      const localOrder = await imbOrderModal.findOne({ order_id: String(orderId) });
      if (!localOrder) {
        return res.status(200).json({
          success: "1",
          message: "Webhook received. Local order not found.",
          order_id: String(orderId),
        });
      }

      const result = await syncImbOrderFromProvider({
        orderDoc: localOrder,
        reqBody: payload,
        payloadSnapshot: payload,
      });

      return res.status(200).json({
        success: "1",
        message: "Webhook processed successfully.",
        order_id: String(orderId),
        status: result.status,
        is_success: result.is_success,
        ledger_message: result.ledger_message,
      });
    }

    const syncLimit = Math.max(
      1,
      Math.min(parseInt(payload.limit || 20), 100)
    );
    const pendingOrders = await imbOrderModal
      .find({ status: { $in: ["CREATED", "PENDING"] } })
      .sort({ updated_at: 1, created_at: 1 })
      .limit(syncLimit);

    if (!pendingOrders.length) {
      return res.status(200).json({
        success: "1",
        message: "No pending orders found for sync.",
        synced_count: 0,
      });
    }

    const results = [];
    for (const orderDoc of pendingOrders) {
      try {
        const result = await syncImbOrderFromProvider({
          orderDoc,
          reqBody: payload,
          payloadSnapshot: payload,
        });
        results.push({
          order_id: result.order_id,
          status: result.status,
          is_success: result.is_success,
          ledger_message: result.ledger_message,
        });
      } catch (syncErr) {
        results.push({
          order_id: String(orderDoc.order_id),
          status: "ERROR",
          is_success: false,
          error: syncErr.message,
        });
      }
    }

    return res.status(200).json({
      success: "1",
      message: "Pending order sync completed.",
      synced_count: results.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: "0",
      message: error.message || "Unable to process webhook.",
    });
  }
};
exports.app_manager = async (req, res) => {
  try {
    const result = schemaapp_manager.validate(req.body);

    if (result.error) {
      return res.status(200).json({ message: result.error.message });
    }

    const user = await User.findOne({
      user_id: req.body.user_id,
      app_id: req.body.app_id,
      user_status: "1",
    });

    if (!user) {
      return res
        .status(200)
        .send({ status: "0", message: "User Not Available Or Blocked" });
    }

    const appController = await appControllerModal.findOne({
      app_id: req.body.app_id,
    });

    const rows = {
      success: "1",
      message: "Balance Fetched Successfully",
      logout: "0",
      crossingmin: 5,
      data: appController,
    };

    res.status(200).send(rows); // Response is sent here, make sure no further response is sent.

    // Proceed with payment_setting lookup after sending response
    const sqlQuery = {
      status: "1",
      app_id: req.body.app_id,
    };

    const payment_setting = await payment_settingModal
      .findOne(sqlQuery)
      .select("getaway")
      .limit(1);

    if (!payment_setting) {
      console.log("Data Not Exists");
      return;
    }

    var gv = payment_setting.toJSON().getaway;
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// exports.app_manager = async (req, res) => {

//   try {
//     const result = schemaapp_manager.validate(req.body);

//     if (result.error) {
//       res.status(200).json({ message: result.error.message });
//     } else {
//       const user = await User.findOne({
//         _id: req.body.user_id,
//         app_id: req.body.app_id,
//         user_status: "1",
//       });
//       if (user) {
//         var cod = req.body.cod;
//         var userBal = user.toJSON().credit;
//         const appController = await appControllerModal.findOne({
//           app_status: "LIVE",
//           app_id: req.body.app_id,
//         });
//         const rows = {
//           success: "1",
//           message: "Balance Fetched Successfully",
//           logout: "0",
//           crossingmin: 5,
//           data: appController,
//         };
//         res.status(200).send(rows);
//         const sqlQuery = {
//           status: "1",
//           app_id: req.body.appId,
//         };
//         const payment_setting = await payment_settingModal
//           .findOne(sqlQuery)
//           .select("getaway")
//           .limit(1);
//         var gv = payment_setting.toJSON().getaway;
//         if (payment_setting) {
//         } else {
//           const market = {
//             message: "Data Not Exits",
//             success: "2",
//           };
//           res.status(200).send(market);
//           return;
//         }
//       } else {
//         res
//           .status(200)
//           .send({ status: "0", message: "User Not Available Or Blocked" });
//         return;
//       }
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//     return;
//   }
// };

exports.add_account = async (req, res) => {
  try {
    const result = schemaadd_account.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      var bank_name = req.body.bank_name;
      var account_holder = req.body.account_holder;
      var account_no = req.body.ac_number;
      var ifsc = req.body.ifsc;
      const user_withdraw = await user_withdrawModal.find({
        user_id: req.body.user_id,
        account_no: account_no,
      });
      if (user_withdraw.length == 0) {
        const user_withdraw1 = await user_withdrawModal.find({
          user_id: req.body.user_id,
        });
        if (user_withdraw1.length > 1) {
          const rows = {
            success: "0",
            message: "Minimum 2 Account Add",
            count: user_withdraw1.length,
          };
          res.status(200).send(rows);
          return;
        }
        //  const count09 = await user_withdrawModal.find().sort({ id: 'desc' }).limit(1).exec();
        //         if (count09.length>0) {
        //         var ids09 = count09[0].id + 1;
        //       } else {
        //         var ids09 = 1;
        //       }
        const pointstore11 = new user_withdrawModal({
          // id:ids09,
          bank_name: bank_name,
          account_holder: account_holder,
          account_no: account_no,
          ifsc: ifsc,
          user_id: req.body.user_id,
        });
        pointstore11.save();
        const user_withdraw11 = await user_withdrawModal.find({
          user_id: req.body.user_id,
        });
        const rows = {
          success: "1",
          message: "Account Created Successfully",
          count: user_withdraw11.length,
        };
        res.status(200).send(rows);
        return;
      } else {
        const user_withdraw111 = await user_withdrawModal.find({
          user_id: req.body.user_id,
        });
        const rows = {
          success: "0",
          message: "Already registered",
          count: user_withdraw111.length,
        };
        res.status(200).send(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

exports.addMsgGroup = async (req, res) => {
  try {
    const result = schemaaddMsgGroup.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
      return;
    } else {
      const user = await User.findOne({
        user_id: req.body.user_id,
        game_host: "0",
      });
      if (user) {
        const rows = {
          success: "0",
          message:
            "अगर आपकी अच्छी गैसिंग है और आप पोस्ट करना चाहते हैं तो बाबा जी से परमिशन लो",
        };
        res.status(200).send(rows);
        return;
      } else {
        const user1 = await User.findOne({
          user_id: req.body.user_id,
        });
        // const count10 = await groupMSgModal.find().sort({ id: 'desc' }).limit(1).exec();
        //         if (count10.length>0) {
        //         var ids10 = count10[0].id + 1;
        //       } else {
        //         var ids10 = 1;
        //       }
        const pointstore11 = new groupMSgModal({
          // id:ids10,
          name: user1.toJSON().FullName,
          user_id: req.body.user_id,
          message: req.body.message,
        });
        pointstore11.save();
        const rows = {
          success: "1",
          message: "Message send Successfully",
        };
        res.status(200).send(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

const chkOtpViaUrl = async (requestid, otp) => {
  try {
    const FormData = require("form-data");
    let data = new FormData();
    data.append("key", "jeTwMY1uOURMMXBxW6wvQiiwBUNKgzVYxlVrPaEkbakCpUwDCuBy");
    data.append("otp", otp);
    data.append("requestId", requestid);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://a2technosoft.services/api/v1/sms-check-otp",
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data.message;
  } catch (error) {
    console.error("OTP sending error:", error);
    return null;
  }
};

// exports.deduct_withdrawweb = async (req, res) => {
//   try {
//     const result = schemadeduct_withdrawweb.validate(req.body);
//     if (result.error) {
//       res.status(200).json({ message: result.error.message });
//     } else {
//       const users = await User.findOne({
//         user_id: req.body.user_id,
//       });

//       const userTemps = await userTempModal.findOne({
//         mob: users.mob,
//       });

//       var reqiestid = await chkOtpViaUrl(userTemps.otp, req.body.otp);
//       if (reqiestid == "Invalid otp") {
//         return res.status(200).json({
//           success: "3",
//           message: "Invalid Otp",
//         });
//       }
//       const appController = await appControllerModal.findOne();
//       if (appController.toJSON().redeem == 0) {
//         const rows = {
//           success: "1",
//           message: "Withdraw Closed",
//         };
//         res.status(200).send(rows);
//       } else {
//         const user1 = await User.findOne({
//           user_id: req.body.user_id,
//           app_id: req.body.app_id,
//           user_status: "1",
//         });
//         const add_bank_accountcount = await add_bank_account.countDocuments({
//           user_id: req.body.user_id,
//           account_number: req.body.account_number,
//         });
//         if (add_bank_accountcount == 0) {
//           return res.status(200).json({
//             success: "3",
//             message: "Invalid Details",
//           });
//         }
//         const accountNumber = String(req.body.account_number).replace(
//           /\s/g,
//           ""
//         );
//         const redAccountList1 = await redAccountList.findOne({
//           ac_number: accountNumber,
//         });
//         var is_fake = 0;
//         if (redAccountList1) {
//           var is_fake = 1;
//         }
//         const appController1 = await appControllerModal.findOne({
//           app_id: req.body.app_id,
//           admin_status: 1,
//         });
//         if (appController1) {
//           if (user1) {
//             var userBal = user1.toJSON().win_amount;
//             var minRedeem = appController1.toJSON().min_redeem;
//             var bal_req = req.body.amount;
//             if (bal_req >= minRedeem) {
//               if (userBal >= bal_req) {
//                 var UpdatedBalance = userBal - bal_req;
//                 var wincredit =
//                   user1.toJSON().win_amount + user1.toJSON().credit;
//                 var newAmount = wincredit - bal_req;
//                 var tr_id =
//                   Math.random().toString(36).substring(2, 15) +
//                   Math.random().toString(36).substring(2, 15);
//                 var transactiniid =
//                   (Math.random() + " ").substring(2, 10) +
//                   (Math.random() + " ").substring(2, 10);
//                 const currentDate = moment();
//                 // Format the date
//                 const currentdate = currentDate.format("DD-MM-YYYY");
//                 const currentdateTime = currentDate.format(
//                   "DD-MM-YYYY HH:mm:ss"
//                 );

//                 if (user1.toJSON().FullName) {
//                   var name = user1.toJSON().FullName;
//                 } else {
//                   var name = "NA";
//                 }
//                 const deductwith = new deduct_withrawModal({
//                   mob: user1.toJSON().mob,
//                   name: name,
//                   bank_name: req.body.bank_name,
//                   account_holder: req.body.account_holder,
//                   account_number: req.body.account_number,
//                   ifsc_code: req.body.ifsc_code,
//                   app_id: req.body.app_id,
//                   user_id: req.body.user_id,
//                   tr_value: bal_req,
//                   transaction_id: tr_id,
//                   is_fake: is_fake,
//                   login_url: "khelogalifaridabad.com",
//                 });
//                 deductwith.save();
//                 const wallettore11 = new walletReportModal({
//                   type: "Debit",
//                   transaction_id: tr_id,
//                   value_update_by: "Withdraw",
//                   user_id: req.body.user_id,
//                   app_id: req.body.app_id,
//                   tr_nature: "TRWITH003",
//                   tr_value: bal_req,
//                   tr_value_updated: newAmount,
//                   date: currentdate,
//                   date_time: currentdateTime,
//                   tr_status: "Pending",
//                   tr_remark: "A/C Withdraw",
//                 });
//                 wallettore11.save();
//                 await User.updateOne(
//                   {
//                     user_id: req.body.user_id,
//                   },
//                   {
//                     $set: {
//                       win_amount: UpdatedBalance,
//                     },
//                   }
//                 );
//                 const chkUserWithdraw = await user_withdrawModal.find({
//                   account_no: req.body.account_number,
//                   user_id: req.body.user_id,
//                 });
//                 if (chkUserWithdraw.length == 0) {
//                   const wallettore11 = new user_withdrawModal({

//                     bank_name: req.body.bank_name,
//                     account_holder: req.body.account_holder,
//                     account_no: req.body.account_number,
//                     user_id: req.body.user_id,
//                     ifsc: req.body.ifsc_code,
//                   });
//                   wallettore11.save();
//                 }
//                 const rows = {
//                   success: 1,
//                   message: "Withdraw Request Successfully Created",
//                 };
//                 res.status(200).send(rows);
//                 return;
//               } else {
//                 const rows = {
//                   success: "2",
//                   message: "Withdraw Request Failed OR InSufficient Balance",
//                 };
//                 res.status(200).send(rows);
//                 return;
//               }
//             } else {
//               const rows = {
//                 success: "4",
//                 message:
//                   "Withdraw Request Failed OR Need Minimum " +
//                   minRedeem +
//                   "Points In Your Wallet Your Balance is " +
//                   userBal +
//                   "Earn More",
//               };
//               res.status(200).send(rows);
//               return;
//             }
//           } else {
//             const rows = {
//               success: "3",
//               message: "User Not Exits Or Blocked Please Check Again",
//             };
//             res.status(200).send(rows);
//             return;
//           }
//         } else {
//           const rows = {
//             success: "3",
//             message: "Please Check Again",
//           };
//           res.status(200).send(rows);
//           return;
//         }
//       }
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//     return;
//   } finally {
//     //mongoose.connection.close();
//
//   }
// };

exports.deduct_withdrawweb = async (req, res) => {
  try {
    const {
      user_id,
      dev_id,
      app_id,
      amount,
      otp,
      message,
      account_number,
      ifsc_code,
    } = req.body;

    if (!account_number || !ifsc_code) {
      return res.status(200).json({
        success: "0",
        message: "Please enter Account number and IFSC code",
      });
    }

    const user = await User.findOne({ user_id, app_id, user_status: 1 });

    if (!user) {
      return res
        .status(200)
        .json({ success: "3", message: "User Not Exists Or Blocked" });
    }

    const appSettings = await appControllerModal.findOne({ app_id });

    if (!appSettings) {
      return res
        .status(200)
        .json({ success: "4", message: "Invalid app configuration" });
    }
    const currentDate = moment();
    const currentTime = currentDate.format("HH:mm");
    if (
      !(
        currentTime >= appSettings.withdraw_open_time &&
        currentTime <= appSettings.withdraw_close_time
      )
    ) {
      return res.status(200).json({
        success: "4",
        message: `Withdraw allowed only from ${appSettings.withdraw_open_time} to ${appSettings.withdraw_close_time}`,
      });
    }

    if (appSettings.withdraw_otp === 1) {
      const otpRecord = await TempOTP.findOne({ mobile: user.mob });

      if (!otpRecord || otpRecord.otp !== otp) {
        return res.status(200).json({ success: "2", message: "Invalid OTP!" });
      }
    }

    const dailyWithdrawals = await pointTableModal.countDocuments({
      user_id,
      //   tr_status: "Success",
      tr_status: { $in: ["Pending", "Success"] },
      tr_nature: "TRWITH003",
      created_at: { $gte: moment().startOf("day").toDate() },
    });

    if (dailyWithdrawals >= 1) {
      return res
        .status(200)
        .json({ success: "2", message: "Only 1 withdrawals allowed per day!" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(200)
        .json({ success: "4", message: "Invalid withdrawal amount!" });
    }

    if (user.win_amount < amount || amount < appSettings.min_redeem) {
      return res.status(200).json({
        success: "4",
        message: `Minimum redeem required is ${appSettings.min_redeem} amount. Your balance is ${user.win_amount}`,
      });
    }

    if (user.win_amount < amount || amount < appSettings.min_redeem) {
      return res.status(200).json({
        success: "4",
        message: `Minimum redeem required is ${appSettings.min_redeem} amount. Your balance is ${user.win_amount}`,
      });
    }

    const updatedBalance = user.win_amount - amount;

    const updateResult = await User.updateOne(
      { user_id, app_id },
      { $set: { win_amount: updatedBalance } }
    );
    const currentDate1 = moment();
    const formattedDate1 = currentDate1.format("DD-MM-YYYY");
    const transaction = new pointTableModal({
      app_id,
      user_id,
      transaction_id: Math.random().toString(36).substr(2, 10),
      tr_nature: "TRWITH003",
      tr_value: amount,
      tr_value_updated: updatedBalance,
      value_update_by: "Withdraw",
      tr_value_type: "Debit",
      tr_remark: `Withdraw By ${user_id}`,
      tr_status: "Pending",
      created_at: new Date(),
      account_no: account_number,
      ifsc_code,
      date: formattedDate1,
    });

    const savedTransaction = await transaction.save();

    return res.status(200).json({
      success: "1",
      message: "Withdraw Request Successfully Created",
      account_no: account_number,
      ifsc_code,
    });
  } catch (error) {
    console.error("Server Error: ", error);
    return res
      .status(500)
      .json({ success: "0", message: "Server Error", error: error.message });
  }
};
exports.deduct_withdrawUpiweb = async (req, res) => {
  try {
    const { user_id, dev_id, app_id, amount, otp, message, upi_id } = req.body;

    if (!upi_id) {
      return res.status(200).json({
        success: "0",
        message: "Please enter UPI ID",
      });
    }

    const user = await User.findOne({ user_id, app_id, user_status: 1 });

    if (!user) {
      return res
        .status(200)
        .json({ success: "3", message: "User Not Exists Or Blocked" });
    }

    const appSettings = await appControllerModal.findOne({ app_id });

    if (!appSettings) {
      return res
        .status(200)
        .json({ success: "4", message: "Invalid app configuration" });
    }
    const currentDate = moment();
    const currentTime = currentDate.format("HH:mm");
    if (
      !(
        currentTime >= appSettings.withdraw_open_time &&
        currentTime <= appSettings.withdraw_close_time
      )
    ) {
      return res.status(200).json({
        success: "4",
        message: `Withdraw allowed only from ${appSettings.withdraw_open_time} to ${appSettings.withdraw_close_time}`,
      });
    }

    if (appSettings.withdraw_otp === 1) {
      const otpRecord = await TempOTP.findOne({ mobile: user.mob });

      if (!otpRecord || otpRecord.otp !== otp) {
        return res.status(200).json({ success: "2", message: "Invalid OTP!" });
      }
    }

    const dailyWithdrawals = await pointTableModal.countDocuments({
      user_id,
      //   tr_status: "Success",
      tr_status: { $in: ["Pending", "Success"] },
      tr_nature: "TRWITH003",
      created_at: { $gte: moment().startOf("day").toDate() },
    });

    if (dailyWithdrawals >= 1) {
      return res
        .status(200)
        .json({ success: "2", message: "Only 1 withdrawals allowed per day!" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(200)
        .json({ success: "4", message: "Invalid withdrawal amount!" });
    }

    if (user.credit < amount || amount < appSettings.min_redeem) {
      return res.status(200).json({
        success: "4",
        message: `Minimum redeem required is ${appSettings.min_redeem} amount. Your balance is ${user.credit}`,
      });
    }

    if (user.credit < amount || amount < appSettings.min_redeem) {
      return res.status(200).json({
        success: "4",
        message: `Minimum redeem required is ${appSettings.min_redeem} amount. Your balance is ${user.credit}`,
      });
    }

    const updatedBalance = user.credit - amount;

    const updateResult = await User.updateOne(
      { user_id, app_id },
      { $set: { credit: updatedBalance } }
    );
    const currentDate1 = moment();
    const formattedDate1 = currentDate1.format("DD-MM-YYYY");
    const transaction = new pointTableModal({
      app_id,
      user_id,
      transaction_id: Math.random().toString(36).substr(2, 10),
      tr_nature: "TRWITH003",
      tr_value: amount,
      tr_value_updated: updatedBalance,
      value_update_by: "Withdraw",
      tr_value_type: "Debit",
      tr_remark: `Withdraw By ${user_id}`,
      tr_status: "Pending",
      created_at: new Date(),
      upi_id: upi_id,
      withdrawType: "upi",
      date: formattedDate1,
    });

    const savedTransaction = await transaction.save();

    return res.status(200).json({
      success: "1",
      message: "Withdraw Request Successfully Created",
    });
  } catch (error) {
    console.error("Server Error: ", error);
    return res
      .status(500)
      .json({ success: "0", message: "Server Error", error: error.message });
  }
};

exports.add_bank_account = async (req, res) => {
  try {
    const result = schemaadd_bank_account.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
    } else {
      const user1 = await User.findOne({
        user_id: req.body.user_id,
        app_id: req.body.app_id,
        user_status: "1",
      });
      if (!req.body.account_number) {
        return res.status(200).json({
          success: "3",
          message: "Please Enter Account Number",
        });
      }
      if (user1) {
        const userTemps = await userTempModal.findOne({
          mob: user1.mob,
          // otp: req.body.otp,
        });
        var reqiestid = await chkOtpViaUrl(userTemps.otp, req.body.otp);
        if (reqiestid == "Invalid otp") {
          return res.status(200).json({
            success: "3",
            message: "Invalid Otp",
          });
        }
        if (user1.toJSON().FullName) {
          var name = user1.toJSON().FullName;
        } else {
          var name = "NA";
        }
        const add_bank_accountcountAll = await add_bank_account.countDocuments({
          mob: user1.mob,
          account_number: req.body.account_number,
        });
        if (add_bank_accountcountAll > 0) {
          return res.status(200).json({
            success: "3",
            message: "Account Number Already Exist",
          });
        }
        const add_bank_accountcount = await add_bank_account.countDocuments({
          mob: user1.mob,
        });
        if (add_bank_accountcount == 0) {
          var status = "approved";
          var msg = "Bank Account Added Successfully and Approved.";
        } else {
          var status = "pending";
          var msg =
            "Bank Account Added Successfully and Pending, Please Wait 10 Minute for Approval.";
        }
        const deductwith = new add_bank_account({
          // id: ids12,
          mob: user1.toJSON().mob,
          name: name,
          bank_name: req.body.bank_name,
          account_holder: req.body.account_holder,
          account_number: req.body.account_number,
          ifsc_code: req.body.ifsc_code,
          app_id: req.body.app_id,
          user_id: req.body.user_id,
          login_url: "babaclubs.in",
          status: status,
        });
        deductwith.save();

        const rows = {
          success: 1,
          message: msg,
        };
        res.status(200).send(rows);
        return;
      } else {
        const rows = {
          success: "3",
          message: "User Not Exits Or Blocked Please Check Again",
        };
        res.status(200).send(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  } finally {
    //mongoose.connection.close();
  }
};

exports.get_bank_accountAll = async (req, res) => {
  try {
    const result = schemaadd_all_bank_account.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
    } else {
      const user1 = await User.findOne({
        user_id: req.body.user_id,
        app_id: req.body.app_id,
        user_status: "1",
      });
      if (user1) {
        const data = await add_bank_account
          .find({
            user_id: req.body.user_id,
          })
          .sort({ created_at: -1 });
        const rows = {
          success: 1,
          data: data,
          message: "Successfully",
        };
        res.status(200).send(rows);
        return;
      } else {
        const rows = {
          success: "3",
          message: "User Not Exits Or Blocked Please Check Again",
        };
        res.status(200).send(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  } finally {
    //mongoose.connection.close();
  }
};

exports.get_bank_accountSuccess = async (req, res) => {
  try {
    const result = schemaadd_success_bank_account.validate(req.body);
    if (result.error) {
      res.status(200).json({ message: result.error.message });
    } else {
      const user1 = await User.findOne({
        user_id: req.body.user_id,
        app_id: req.body.app_id,
        user_status: "1",
      });
      if (user1) {
        const data = await add_bank_account.find({
          user_id: req.body.user_id,
          status: "approved",
        });
        const rows = {
          success: 1,
          data: data,
          message: "Successfully",
        };
        res.status(200).send(rows);
        return;
      } else {
        const rows = {
          success: "3",
          message: "User Not Exits Or Blocked Please Check Again",
        };
        res.status(200).send(rows);
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  } finally {
    //mongoose.connection.close();
  }
};