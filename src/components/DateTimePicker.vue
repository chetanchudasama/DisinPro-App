<template>
<div :class="isCurrentTime ? 'time-access-content' : ''">
    <v-tooltip bottom v-if="showPresentTimeIcon">
      <template v-slot:activator="{ on }">
        <v-icon  v-on="on" class="mr-0 text--darken-2 present-time" color="grey" @click="OnClickPresentTime" :disabled="disabled">access_time</v-icon>
      </template>
      <span>Current Time</span>
    </v-tooltip>
      <div class="dateTimeControl">
        <v-menu v-if="!isStaticLocation"
          v-model="showControl"
          omits
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          :disabled="disabled"
          nudge-left="40"
          :min-width="(!hideTimePicker ? '430' : '290') + 'px'"
          class="calendar-menu"
        >
         <template v-slot:activator="{ on }">
        <v-text-field
          v-if="isValidationRequired"
          v-on="on"
          :label="placeHolderText"
          readonly required
          class="required" 
          :value="selectedValueForDisplay"
          data-vv-name="DateTimePicker" 
          :error-messages="validationMessage('DateTimePicker', placeHolderText)"
          v-validate="'required'"
          :disabled="disabled"
        ></v-text-field>
        <v-text-field
          v-else
          v-on="on"
          :label="placeHolderText"
          readonly required
          :value="selectedValueForDisplay"
          :disabled="disabled"
        ></v-text-field>
         </template>
        <v-card class="date-time-picker">
          <v-container>
            <v-layout wrap>
              <v-flex xs4 class="left-part primary" v-if="!hideTimePicker">
                <div class="c-datepicker__header">
                  <div class="c-datepicker__header-day">
                    <span class="js-day">{{dayName}}</span>
                  </div>
                  <div class="c-datepicker__header-date">
                    <span class="c-datepicker__header-date__month js-date-month">{{yearName}}</span>
                    <span class="c-datepicker__header-date__day js-date-day">{{dayValue}}</span>
                    <span class="c-datepicker__header-date__time js-date-time">
                      <span class="c-datepicker__header-date__hours js-date-hours active">{{timeValue}}</span>
                    </span>
                  </div>
                </div>
                <div class="activators">
                  <div>
                    <v-icon @click.prevent="onClickDate" class="access-date" color="#ffffff">event</v-icon>
                  </div>
                  <div>
                    <v-icon @click.prevent="onClickTime" class="access-time" color="#ffffff">access_time</v-icon>
                  </div>
                </div>
              </v-flex>
              <v-flex :class="!hideTimePicker ? 'xs8' : 'xs12'">
                <v-date-picker 
                v-model="dateModel"
                no-title  
                @input="clickAnyDate"
                scrollable 
                :min="minDate"
                :max="maxDate" 
                v-if="selectedTab == DateTab"
                color="primary"   
                :allowed-dates="isDateAllowToSelect"
                class="date-picker"
                > 
              </v-date-picker>
              <v-time-picker
              v-model="timeModel"                        
              scrollable
              v-if="selectedTab == TimeTab" 
              format="24hr"
              :min="minTime"
              :max="maxTime"
              color="primary"
              no-title
              :allowed-minutes="allowedMinutes"
              class="time-picker"
              >          
            </v-time-picker>
            <v-card-actions>
              <v-btn v-if="clearable && initialValue" text color="primary" @click="onClickClear">Clear</v-btn>
              <v-spacer v-else/>
              <v-btn text color="primary" class="btn-cancel" @click="onClickCancel">Cancel</v-btn>     
              <v-btn text color="primary" class="btn-ok" @click="onClickOk">OK</v-btn>         
            </v-card-actions> 
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>         
    </v-menu>
    <v-card class="date-time-picker" v-if="isStaticLocation">
          <v-container>
            <v-layout wrap>
              <v-flex xs4 class="left-part primary" v-if="!hideTimePicker">
                <div class="c-datepicker__header">
                  <div class="c-datepicker__header-day">
                    <span class="js-day">{{dayName}}</span>
                  </div>
                  <div class="c-datepicker__header-date">
                    <span class="c-datepicker__header-date__month js-date-month">{{yearName}}</span>
                    <span class="c-datepicker__header-date__day js-date-day">{{dayValue}}</span>
                    <span class="c-datepicker__header-date__time js-date-time">
                      <span class="c-datepicker__header-date__hours js-date-hours active">{{timeValue}}</span>
                    </span>
                  </div>
                </div>
                <div class="activators">
                  <div>
                    <v-icon @click.prevent="onClickDate">event</v-icon>
                  </div>
                  <div>
                    <v-icon @click.prevent="onClickTime">access_time</v-icon>
                  </div>
                </div>
              </v-flex>
              <v-flex :class="!hideTimePicker ? 'xs8' : 'xs12'">
                <v-date-picker 
                v-model="dateModel" 
                @input="clickAnyDate"
                no-title  
                scrollable 
                :min="minDate"
                :max="maxDate" 
                v-if="selectedTab == DateTab"
                color="primary"
                class="static-date-picker"
                > 
              </v-date-picker>
              <v-time-picker
              v-model="timeModel"                        
              scrollable
              v-if="selectedTab == TimeTab" 
              format="24hr"
              :min="minTime"
              :max="maxTime"
              color="primary"
              no-title
              >          
            </v-time-picker>
            <v-card-actions>
              <v-btn v-if="clearable && initialValue" text color="primary" @click="onClickClear">Clear</v-btn>
              <v-spacer v-else/>
              <v-btn text color="primary" @click="onClickCancel">Cancel</v-btn>     
              <v-btn text color="primary" @click="onClickOk">OK</v-btn>         
            </v-card-actions> 
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
    </div>
</div>
</template>

<style scoped>
.date-time-picker .v-card {
  box-shadow: none;
}
.date-time-picker .v-picker--date.v-card {
  width: 100%;
}
.date-time-picker .container {
  margin: 0;
  padding: 0;
}
.date-time-picker >>> .v-picker__body {
  flex: none;
  margin-top: 10px;
}
.date-time-picker >>> .v-date-picker-years {
  max-height: 274px;
} /*to match the height of both datepicker and timepicker */
.date-time-picker >>> .v-picker--time {
  min-height: 296px;
} /*to match the height of both datepicker and timepicker */
.date-time-picker .container,
.date-time-picker .flex {
  padding: 0;
} /* to set datetimepicker space to be 0 */

.date-time-picker >>> .time-picker-clock {
  background: rgba(0, 0, 0, 0.05);
} /* lighten the background */
.date-time-picker >>> .time-picker-clock__container {
  align-items: flex-start;
  padding: 0;
  height: 270px !important;
}
.date-time-picker >>> .time-picker-clock > span {
  font-size: 14px;
  line-height: 18px;
} /*reduced the font-size to set with theme*/
.date-time-picker >>> .v-picker__body {
  display: flex;
  justify-content: center;
} /*to create column structure*/
.date-time-picker .left-part {
  position: relative;
  color: #ffffff;
} /*styling of the left custom part*/
.date-time-picker .left-part .activators {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
} /*to align the activators in the bottom of the block*/
.date-time-picker .left-part .activators div {
  cursor: pointer;
} /* to let cursor visible */
.date-time-picker .left-part i {
  color: #ffffff;
} /* color styling of icons */

.c-datepicker__header {
  text-align: center;
} /*styling of the left custom part*/
.c-datepicker__header-day {
  padding: 10px;
  font-size: 17px;
  line-height: 21px;
  background: rgba(0, 0, 0, 0.2);
} /*styling of the left custom part*/
.c-datepicker__header-date {
  padding: 30px 10px;
} /*styling of the left custom part*/
.c-datepicker__header-date > span {
  display: block;
  font-size: 16px;
  line-height: 19px;
  margin-bottom: 10px;
} /*styling of the left custom part*/
.c-datepicker__header-date > span.js-date-day {
  line-height: 64px;
  font-size: 60px;
} /*styling of the left custom part*/

/*Current time icon*/
.time-access-content{
  position: relative !important; 
}
.time-access-content .present-time{   
  position: absolute;
  right:-4px;
  top: 12px;
  height: 34px;
  width: 36px;
  text-align: right;  
  margin-right: 3px;
  z-index: 1;
}
.time-access-content >>> .v-input {padding-right: 30px;}
.time-access-content .present-time >>> .v-icon{
  cursor: pointer; 
}
.dateTimeControl >>> .v-input .v-text-field__slot input {padding-right: 30px;background-image: url(/img/calendar-ic.svg) !important;background-size: 18px;background-repeat: no-repeat;background-position: right 6px;cursor: pointer;margin-right: 3px;}
</style>

<script lang="ts" >
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import moment, { isMoment } from "moment";
import Shared from "@/common/shared";

enum Tab {
  Date,
  Time,
}

@Component
export default class DateTimePicker extends Vue {
  public static DATE_FORMAT: string = Shared.dateFormatForDatePicker;
  public static TIME_FORMAT: string = "HH:mm";
  public static DATE_TIME_FORMAT: string = DateTimePicker.DATE_FORMAT +
    " " +
    DateTimePicker.TIME_FORMAT;

  private DateTab: Tab = Tab.Date;
  private TimeTab: Tab = Tab.Time;
  private controlDate: moment.Moment | null | undefined = null;
  private initialValue: moment.Moment | null | undefined = null;

  @Prop() private dateTime: moment.Moment;
  @Prop() private placeHolderText: string;
  @Prop() private minDate: string;
  @Prop() private maxDate: string;
  @Prop() private minTime: string;
  @Prop() private maxTime: string;
  @Prop() private displayFormat: string;
  @Prop() private isStaticLocation: boolean;
  @Prop() private isValidationRequired: boolean;
  @Prop() private disabled: boolean;
  @Prop({default: false}) private showPresentTimeIcon: boolean;
  @Prop() private isCurrentTime: boolean;
  @Prop() private allowedDates: string[];
  @Prop({default: false}) private allowedMinutesStep: boolean;
  @Prop({default: false}) private hideTimePicker: boolean;
  @Prop({default: false}) private clearable: boolean;

  private showControl = false;
  private dateModel: string = "";
  private timeModel: string = "00:00";
  private selectedTab: Tab = Tab.Date;

  private pauseEmit: boolean = true;

  private mounted() {
    this.pauseEmit = true;
    this.setDateTimeModelsFromValue(this.dateTime);
    this.setControlDate();
    this.pauseEmit = false;
  }

  @Watch("dateTime")
  private valueChanged(newValue: moment.Moment | null | undefined) {
    this.$validator.errors.items = [];
    this.pauseEmit = true;
    this.setDateTimeModelsFromValue(newValue);
    this.setControlDate();
    this.pauseEmit = false;
  }

  @Watch("dateModel")
  private dateChanged(newValue: string) {
    this.setControlDate();
    if (!this.hideTimePicker) {
      this.selectedTab = Tab.Time;
    }
  }

  @Watch("timeModel")
  private timeChanged(newValue: string) {
    this.setControlDate();
  }

  @Watch("showControl")
  private controlVisiblityChanged(showingControl: boolean) {
    if (showingControl) {
      this.selectedTab = Tab.Date;
      this.initialValue = this.dateTime;
    }
  }

  private setControlDate(): void {
    if (this.dateModel && this.timeModel) {
      const val = this.dateModel + " " + this.timeModel;
      this.controlDate = moment(val, DateTimePicker.DATE_TIME_FORMAT);
    } else {
      this.controlDate = undefined;
    }
    if (!this.pauseEmit) {
      this.emitValueEvent(this.controlDate);
    }
  }

  private emitValueEvent(value: moment.Moment | null | undefined) {
    this.$emit("update:dateTime", value);
  }

  private setDateTimeModelsFromValue(
    newValue: moment.Moment | null | undefined,
  ): void {
    if (!moment.isMoment(newValue) || !newValue.isValid()) {
      this.dateModel = "";
      this.timeModel = "00:00";
      return;
    }

    const newDate: moment.Moment = moment(
      newValue.format(DateTimePicker.DATE_FORMAT),
      DateTimePicker.DATE_FORMAT,
    );
    const newTime: moment.Moment = moment(
      newValue.format(DateTimePicker.TIME_FORMAT),
      DateTimePicker.TIME_FORMAT,
    );

    if (this.minDate) {
      if (moment(this.minDate, DateTimePicker.DATE_FORMAT).isAfter(newDate)) {
        return;
      }
    }
    if (this.maxDate) {
      if (moment(this.maxDate, DateTimePicker.DATE_FORMAT).isBefore(newDate)) {
        return;
      }
    }
    if (this.minTime) {
      if (moment(this.minTime, DateTimePicker.TIME_FORMAT).isAfter(newTime)) {
        return;
      }
    }
    if (this.maxTime) {
      if (moment(this.maxTime, DateTimePicker.TIME_FORMAT).isBefore(newTime)) {
        return;
      }
    }

    const ndm: string = newValue.format(DateTimePicker.DATE_FORMAT);
    if (ndm !== this.dateModel) {
      this.dateModel = ndm;
    }

    const ntm: string = newValue.format(DateTimePicker.TIME_FORMAT);
    if (ntm !== this.timeModel) {
      this.timeModel = ntm;
    }
  }

  private get selectedValueForDisplay(): string {
    if (moment.isMoment(this.dateTime) && this.dateTime.isValid()) {
      // return formatted date as per set in Environment json
      const formattedDate: string = this.displayFormat ?  Shared.getFormatedDate(moment(this.dateTime), this.displayFormat) : Shared.getFormatedDate(moment(this.dateTime), "DD/MM/YYYY HH:mm");
      return formattedDate;
    } else {
      if (this.isValidationRequired !== true) {
        if (this.hideTimePicker) {
          return "---- -- --";
        }
        return "---- -- -- --:--";
      } else {
        return "";
      }
    }
  }

  private get yearName(): string {
    if (moment.isMoment(this.controlDate) && this.controlDate.isValid()) {
      return this.controlDate.format("MMMM YYYY");
    }
    return "-- ----";
  }

  private get dayName(): string {
    if (moment.isMoment(this.controlDate) && this.controlDate.isValid()) {
      return this.controlDate.format("dddd");
    }
    return "--";
  }

  private get dayValue(): string {
    if (moment.isMoment(this.controlDate) && this.controlDate.isValid()) {
      return this.controlDate.format("DD");
    }
    return "--";
  }

  private get timeValue(): string {
    if (moment.isMoment(this.controlDate) && this.controlDate.isValid()) {
      return this.controlDate.format("HH:mm");
    }
    return "--:--";
  }

  private onClickDate() {
    this.selectedTab = Tab.Date;
  }

  private onClickTime() {
    this.selectedTab = Tab.Time;
  }

  private onClickOk() {
    this.showControl = false;
  }

  private onClickCancel() {
    // user cancelled, reset dateTime back to value given on display
    this.emitValueEvent(this.initialValue);
    this.showControl = false;
  }

  private onClickClear() {
    this.emitValueEvent(null);
    this.showControl = false;
  }

  // Click present time icon to set current value
  private OnClickPresentTime() {
    this.$validator.errors.items = [];
    // close current date picker control
    this.showControl = false;
    this.emitValueEvent(moment(new Date()));
  }

  private clickAnyDate() {
    this.dateChanged(this.dateModel);
  }

  private validationMessage(label: string, errorText: string) {
    let message: string = this.$validator.errors.collect(label)[0];
    const errorMessage = label.split(/(\d+)/);
    return message
      ? (message = "The " + errorText + " date is required.")
      : message;
  }

  private isDateAllowToSelect(date: string) {
    if (this.allowedDates && this.allowedDates.length > 0) {
      return this.allowedDates.indexOf(date) !== -1;
    }
    return true;
  }

  private allowedMinutes(value: number) {
    if (this.allowedMinutesStep) {
      return value % 15 === 0;
    }
    return true;
  }
}
</script>
