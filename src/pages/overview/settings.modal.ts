import {Component, KeyValueDiffers, KeyValueDiffer, DoCheck, KeyValueChangeRecord} from "@angular/core";
import {ViewController, NavParams} from "ionic-angular";
import {District, Settings, DataState} from "../../common/models";
import {InAppBrowser} from "ionic-native";
import {WastlDataService} from "../../services/wastl-data.service";
import {ToastMessageProvider} from "../../common/toast-message-provider";
import {StorageService} from "../../services/storage.service";

@Component({
	selector: "settings-modal",
	templateUrl: "settings.html"
})
export class SettingsModal implements DoCheck {

	private districts: District[];
	private differ: KeyValueDiffer;

	private token: string = "";
	private waitForToken: boolean = false;
	private loadingTokenInfo: boolean = false;
	private homeAddress: string;

	private settings: Settings = {
		myDistrict: "LWZ",
		jumpToDistrict: false,
		showExtendedIncidentData: false,
		showIncidentHydrants: true,
		showIncidentDistance: true
	};

	constructor(navParams: NavParams,
				private viewController: ViewController,
				private storageService: StorageService,
				private differs: KeyValueDiffers,
				private dataService: WastlDataService,
				private messageProvider: ToastMessageProvider) {

		this.differ = differs.find({}).create(null);
		this.districts = navParams.get("districts");

		storageService.findSettings().then(settings => {
			if (settings != null) {
				this.settings = settings;
			}
		});

		this.dataService.findHomeAddress().subscribe(homeAddress => {
			this.homeAddress = homeAddress;
		});
	}

	public close(): void {
		this.viewController.dismiss();
	}

	public ngDoCheck(): void {
		let changes = this.differ.diff(this.settings);

		if (!changes) {
			return;
		}

		this.storageService.saveSettings(this.settings);

		changes.forEachChangedItem((record: KeyValueChangeRecord) => {
			if (record.key == "showExtendedIncidentData" && record.currentValue == true) {
				this.updateToken();
			}

			this.debugSettingsChange("changed", record);
		});
		changes.forEachAddedItem(r => this.debugSettingsChange("added", r));
		changes.forEachRemovedItem(r => this.debugSettingsChange("removed", r));
	}

	private debugSettingsChange(type: string, record: KeyValueChangeRecord): void {
		console.debug("Settings changed: " + record.toString() + " " + type);
	}

	public openUrl(url: string) {
		new InAppBrowser(url, "_system");
	}

	public copyTokenToClipboard(): void {
		// TODO
	}

	private updateToken(): void {
		this.loadingTokenInfo = true;

		this.dataService.findInfoScreenData().subscribe(data => {
			this.waitForToken = data.state == DataState.TOKEN || data.state == DataState.WAITING;

			if (this.waitForToken) {
				this.token = data.token;
			}

			this.loadingTokenInfo = false;
		}, e => this.messageProvider.showHttpError(e));

	}
}