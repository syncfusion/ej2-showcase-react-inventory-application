import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  Toolbar,
  Edit,
  Selection,
  Sort,
  CommandColumn,
} from "@syncfusion/ej2-react-grids";
import {
  DialogComponent,
  ButtonPropsModel,
  AnimationSettingsModel,
} from "@syncfusion/ej2-react-popups";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { DateTimePickerComponent } from "@syncfusion/ej2-react-calendars";
import {
  MaskedTextBoxComponent,
  TextAreaComponent,
  TextBox,
  TextBoxComponent,
} from "@syncfusion/ej2-react-inputs";
import React, { useRef, useEffect, useState } from "react";
import { productData } from "./datasource";
import { AutoComplete, AutoCompleteComponent, ChangeEventArgs } from "@syncfusion/ej2-react-dropdowns";
import { isNullOrUndefined } from '@syncfusion/ej2-base';

  let customerDatabase: object[] = [
    {
      id: 2401,
      name: "Alice Johnson",
      address: "1234 Oak Street, Anytown, CA 12345",
      phone: "(555) 123-4567",
    },
    {
      id: 2402,
      name: "Bob Williams",
      address: "5678 Maple Avenue, Springfield, NY 67890",
      phone: "(555) 234-5678",
    },
    {
      id: 2403,
      name: "Charlie Brown",
      address: "9101 Pine Road, Lakeside, TX 34567",
      phone: "(555) 345-6789",
    },
    {
      id: 2404,
      name: "Diana Miller",
      address: "1122 Elm Street, Rivertown, FL 45678",
      phone: "(555) 456-7890",
    },
    {
      id: 2405,
      name: "Eva Davis",
      address: "1313 Willow Lane, Mountain View, CA 89012",
      phone: "(555) 567-8901",
    },
  ];

  function App() {
    //Primary grid component ref property
    let gridInstance = useRef<GridComponent>(null);

    //Search grid - dialog popup component ref property
    let dialogInstance = useRef<DialogComponent>(null)

    //Cash Calculator - Dialog Ref Properties
    const cashPaidRef = useRef(null);
    const balanceRef = useRef(null);
    const cashCalculatorRef = useRef<HTMLDivElement>(null);

    //Toggle Delivery type Button ref property
    const buttonRef = useRef<ButtonComponent>(null);

    const datePicker = useRef<DateTimePickerComponent>(null);

    //customer id input - autocomplete ref property.
    const customerIDRef = useRef(null);

    //add new customer button - autocomplete ref property.
    const plusButtonRef = useRef(null);

    // header - customer details ref property.
    const customerNameRef = useRef(null);
    const customerAddressRef = useRef(null);
    const customerPhoneRef = useRef(null);

    // Add new customer dialog popup - ref property.
    const newCustomerFormRef = useRef(null);
    const newCustomerNameRef = useRef(null);
    const newCustomerPhoneRef = useRef(null);
    const newCustomerAddressRef = useRef(null);

    //Search grid - instance ref property.
    let productSearchGridInstance = useRef<GridComponent>(null);
    const searchGridToolbarOptions: any = ["Search"];
    const animationSettings: AnimationSettingsModel = { effect: "None" };
    const selectionSettings: any = { mode: "Row", type: "Multiple", checkboxOnly: true };
    const searchGridSelectionSettings: any = { mode: "Row", type: "Multiple" };
    const toolbarOptions: any = ["Delete"];
    const wrapSettings: any = { text: "Header", value: "Header" };
    const editSettings: any = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      showAddNewRow: true,
      newRowPosition: "Bottom",
    };

    // to refresh the component once print is performed
    const [refresh, setRefresh] = useState(false);

    // To swap the button elements visiblity on save customer details dialog & print dialog popup.
    const [isPrintButtonVisible, setIsPrintButtonVisible] = useState(true);
    const [isSaveButtonVisible, setIsSaveButtonVisible] = useState(false);

    // state to update current time in header - date picker element
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    let balanceAmount = "";
    let cashPaidAmount = "";
    const commands: any = [
      {
        type: "Cancel",
        buttonOption: {
          iconCss: "e-icons e-cancel-icon",
          cssClass: "e-flat",
          title: "Delete item",
        },
      },
    ];
    const idRules: Object = { required: true, minLength: 4, number: true };
    const qtyRule = {
      required: true,
      minLength: 0,
      number: true,
      min: 1
    };
    const productRule: Object = { required: true };
    let prevProductID: String = "";
    let prevProductName: String = "";

    // Print confirmation dialog & Add Customer details dialog popup buttons and its click event declartion.
    let confirmationDialog = useRef<DialogComponent>(null);
    let buttons: ButtonPropsModel[] = [
      {
        // Click the footer buttons to hide the Dialog
        click: () => {
          (confirmationDialog.current as DialogComponent).hide();
          if (
            !customerAddressRef.current.value ||
            !customerPhoneRef.current.value ||
            !customerNameRef.current.value ||
            !customerIDRef.current.value
          ) {
            alert(
              "Please enter customer id to print the bill."
            );
            return; // Stop further execution
          }
          else {
          (gridInstance.current as GridComponent).print();
          }
        },
        // Accessing button component properties by buttonModel property
        buttonModel: {
          content: "Print Bill",
          cssClass: isPrintButtonVisible ? '' : 'e-hide',
        },
      },
      {
        click: (): void  => {
            const customerPhone = newCustomerPhoneRef.current.value.replace(/\D/g, '');
            // Check if the customer ID already exists
            const customerExists = customerDatabase.some(
              (customer) => (customer as any).phone.replace(/\D/g, '') === customerPhone
            );
            if (customerExists) {
              alert("Customer phone number already exists. Please choose a different phone.");
            } else {
              if (
                !newCustomerAddressRef.current.value ||
                !newCustomerNameRef.current.value ||
                !newCustomerPhoneRef.current.value
              ) {
                alert(
                  "Please fill in all the fields (name, address and phone number)."
                );
                return; // Stop further execution
              }
              // Add the new customer to the database
              customerDatabase.push({
                id: parseInt(((customerDatabase[customerDatabase.length - 1] as any).id + 1), 10),
                name: newCustomerNameRef.current.value,
                address: newCustomerAddressRef.current.value,
                phone: newCustomerPhoneRef.current.value,
              });
              // Display a success message
              alert(`New customer added successfully - Customer id : ${parseInt((customerDatabase[customerDatabase.length - 1] as any).id)}`);}
              customerIDRef.current.value = parseInt((customerDatabase[customerDatabase.length - 1] as any).id);
              confirmationDialog.current.hide();
        },
        buttonModel: {
        content: "Save",
        cssClass: isSaveButtonVisible ? '' : 'e-hide',
        },
    }
    ];

    // State to set and reset delivery type - take away  / door delivery
    const [deliveryType, setDeliveryType] = useState("Take Away");
    const deliverytypeRef = useRef(null);

    /// Functions
    // Header - Customer details panel functions

      // Function to generate Bill No
      const generateBillNo = (): string => {
        // Logic to generate Bill No
        const randomNo: number = Math.floor(100000 + Math.random() * 900000);
        return randomNo.toString();
      };

      useEffect(() => {
        const generatedBillNo: any = generateBillNo();
        // Set Bill No to the input field
        const billNoInput = document.getElementById("billNoInput");
        if (billNoInput) {
          (billNoInput as HTMLInputElement).value = generatedBillNo;
        }
    
        // Set current date and time in the Date picker
        const interval = setInterval(() => {
          setCurrentDateTime(new Date());
        }, 1000); // Update every second

        // keyup event handler binded and removed for header - customer id input element.
        const customerIDInput = customerIDRef.current;
        customerIDInput.addEventListener("change", handleCustomerIDChange);
    
        return () => {
          customerIDInput.removeEventListener("change", handleCustomerIDChange);
          clearInterval(interval);
        };
      }, [refresh]);

      //function to handle customer id input element changes - change event.
      const handleCustomerIDChange = (event: ChangeEventArgs): void  => {
        const enteredID: number = parseInt(event.value as string);
        const foundCustomer: any = customerDatabase.find(
          (customer) => (customer as any).id === enteredID
        );
        if (foundCustomer) {
          customerNameRef.current.value = foundCustomer.name;
          customerAddressRef.current.value = foundCustomer.address;
          customerPhoneRef.current.value = foundCustomer.phone;
        } else {
          if (event.value) {
            alert("Customer ID does not exist. Please enter details and press the plus button to register the customer.");
          }
          customerNameRef.current.value = "";
          customerAddressRef.current.value = "";
          customerPhoneRef.current.value = "";
        }
      };

      // Function to render Add new customer dialog on `+` button click.
      const addNewCustomer = (): void => {
          cashCalculatorRef.current.style.display = "none";
          newCustomerAddressRef.current.value = '';
          newCustomerPhoneRef.current.value = '';
          newCustomerNameRef.current.value = '';
          (
            confirmationDialog.current.element.querySelector(
              "#cashorupi"
            ) as HTMLElement
          ).style.display = "none";
          newCustomerFormRef.current.style.display = "block";
          setIsPrintButtonVisible(false);
          setIsSaveButtonVisible(true);
          confirmationDialog.current.header = 'Add New Customer Details'
          confirmationDialog.current.show();
      };
    
    // Grid component's Events and Functions
      //Grid action complete event.
      const actionComplete = (args: any): void => {
        if (args.action === "add" && args.requestType === "save") {
          const lastRowIndex = gridInstance.current.getRows().length - 1; // Get the index of the last row
          productSearchGridInstance.current.clearSelection();
          dialogInstance.current.hide();
          gridInstance.current.editModule.startEdit(gridInstance.current.getRowByIndex(lastRowIndex) as HTMLTableRowElement);
          const ele = (gridInstance.current
            .getContent()
            .querySelectorAll(".e-editedrow .e-rowcell")[4]
            .querySelector(".e-textbox") as HTMLInputElement);
          ele.value = "";
          ele.focus();
          (gridInstance.current
            .getContent()
            .querySelectorAll(".e-editedrow .e-rowcell")[1]
            .querySelector(".e-textbox") as HTMLInputElement).value = (
            gridInstance.current.dataSource as any
          ).length;
        }
        if (args.action === "edit" && args.requestType === "save") {
          setTimeout(() => {
            (
              gridInstance.current
                .getContent()
                .querySelectorAll(".e-addedrow .e-rowcell")[2]
                .querySelector(".e-input") as HTMLInputElement
            ).click();
          }, 0);
        }
        if (args.requestType === "delete") {
          if (gridInstance.current.getCurrentViewRecords().length === 0) {
            clearData();
          }
        }
        updateSavingsDisplay(gridInstance.current.dataSource);
        totalNetAmount(gridInstance.current.dataSource);
        (document.querySelector("#totalItems") as HTMLElement).innerHTML = (
          gridInstance.current as any
        ).dataSource.length;
        createdGrid();
      };

      //Grid created event.
      const createdGrid = (args?: any): void => {
        gridInstance.current.getContent().querySelector(".e-addedrow .e-rowcell .e-checkbox-wrapper").classList.add('e-checkbox-disabled');
      }

      //Function to Calculate total savings of the bill amount
      function computeSavings(dataSource: any): number {
        let savings = 0;
        dataSource.forEach((item: any) => {
          const MRP = item.MRP;
          const Price = item.Price;
          const Qty = parseFloat(item.Quantity) || 0;
          const Discount = parseFloat(item.Discount) || 0;
          if (Qty !== 0) savings += (MRP - Price) * Qty + Discount;
        });
        return savings;
      }

      function totalNetAmount(dataSource: any): void {
        let totalAmount = 0;
        dataSource.forEach((item: any) => {
          if (item.Qty !== 0) {
            totalAmount += item.Total;
          }
        });
        (document.querySelector("#totalNetAmount") as HTMLElement).innerHTML = "$" + totalAmount.toFixed(2);
      }
    
      //Function to Update savings card element with proper savings amount.
      function updateSavingsDisplay(dataSource: any): void {
        const computedSavings = computeSavings(dataSource);
        (document.querySelector("#yourSavings") as HTMLElement).innerHTML =
          "$" + computedSavings.toFixed(2);
      }

      //Grid action begin event
      const actionBegin = (args: any): void => {
        if (args.requestType === 'save') {
          args.index = (gridInstance.current.pageSettings.currentPage * gridInstance.current.pageSettings.pageSize) - 1;
          productSearchGridInstance.current.clearSelection();
          dialogInstance.current.hide();
        }
      };

      //Grid before print event.
      const beforePrint = (args: any): void => {
        // Cancel default Grid print action
        args.cancel = true;
    
        const currentDate = new Date(datePicker.current.value);
        // Format date and time
        const formattedDate = currentDate.toLocaleDateString();
        const formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const formattedDateTime = formattedDate + "  Time: " + formattedTime;
        let isDoorDelivery =
        deliverytypeRef.current.textContent === "Door Delivery"
            ? true
            : false;
        function printTable(
          gridInstance: any,
          shopName: any,
          billNo: any,
          customerName: any,
          phoneNumber: any,
          address: any,
          formattedDateTime: any,
          totalAmount: any,
          savings: any,
          isDoorDelivery: any,
        ) {
          let data = gridInstance.dataSource;
          let columnConfig = gridInstance.columns;
          let printWindow = window.open(
            "",
            "_blank",
            "width=" + window.outerWidth + ",height=" + window.outerHeight
          );
    
          if (printWindow) {
            printWindow.document.write(
              "<style>table{width:100%;}th,td{ text-align:left;}th{background-color:#f2f2f2;}tr:last-child td{border:none;}</style>"
            );
            printWindow.document.write("</head><body style='margin-top: 10px;'>");
    
            // Shop details
            printWindow.document.write(
              '<div style="text-align:center;">' +
                "<h1>" +
                shopName.toUpperCase() +
                "</h1>" +
                "<p>ADDRESS: 888 WALL STREET, WALL CITY, LA 88888</p>" +
                "<p>PHONE: 123-456-7890</p>" +
                "</div>"
            );
    
            // Date and bill details
            printWindow.document.write(
              '<table>' +
                "<tr>" +
                '<td style="border: none; text-align: left;">BILL NO: ' +
                billNo.toUpperCase() +
                "</td>" +
                '<td style="border: none; text-align: right;">DATE: ' +
                formattedDateTime.toUpperCase() +
                "</td>" +
                "</tr>" +
                "<tr>" +
                '<td style="border: none; text-align: left; padding-bottom: 2px" colspan="2">CUSTOMER NAME: ' +
                customerName.toUpperCase() +
                "</td>" +
                '<td style="border: none;"></td>' + // Empty cell
                "</tr>"
            );
    
            // Customer details
            if (isDoorDelivery) {
              printWindow.document.write(
                "<tr>" +
                  '<td style="border: none; text-align: left; padding-bottom: 2px" colspan="2">CUSTOMER ADDRESS: ' +
                  address.toUpperCase() +
                  "</td>" +
                  '<td style="border: none;"></td>' + // Empty cell
                  "</tr>" +
                  "<tr>" +
                  '<td style="border: none; text-align: left; padding-bottom: 2px" colspan="2">CUSTOMER PHONE: ' +
                  phoneNumber.toUpperCase() +
                  "</td>" +
                  '<td style="border: none;"></td>' + // Empty cell
                  "</tr>"
              );
            }
    
            printWindow.document.write("</table>");
            printWindow.document.write('<br style="clear:both;">');
            printWindow.document.write('<div style="width: 100%; padding: 10px; text-align: center;">' + '*************************************' + '</div>');


    
            // Table
            printWindow.document.write("<table>");
    
            // Header row
            let headerRow = "<thead><tr>";
            columnConfig.forEach((column: any) => {
              if (
                column.headerText !== "" &&
                column.headerText !== "Product ID" &&
                column.headerText !== "Manage Items"
              ) {
                // Determine text alignment based on column field
                let textAlign = "";
                let headerText = "";
                if (
                  column.field === "Quantity" ||
                  column.field === "MRP" ||
                  column.field === "Price" ||
                  column.field === "Discount" ||
                  column.field === "Tax" ||
                  column.field === "Total"
                ) {
                  textAlign = "right";
                } else if (column.field === "SNO") {
                  textAlign = "center";
                }
                if (column.field === "Tax") {
                  headerText = "TR";
                }
                else {
                  headerText = column.headerText.toUpperCase();
                }
                headerRow +=
                  "<th <th style='text-align: " +
                  textAlign +
                  ";'>" + headerText +
                  "</th>";
              }
            });
            headerRow += "</tr></thead>";
            printWindow.document.write(headerRow);
    
            // Data rows
            printWindow.document.write("<tbody>");
            data.forEach((item: any) => {
              let row = "<tr>";
              columnConfig.forEach((column: any) => {
                if (
                  column.headerText !== "" &&
                  column.headerText !== "Product ID" &&
                  column.headerText !== "Manage Items"
                ) {
                  let cellValue = item[column.field];
                  if (cellValue instanceof Date) {
                    cellValue = cellValue.toLocaleDateString();
                  }
                  if (column.field === "Total") {
                    cellValue = parseFloat(cellValue).toFixed(2);
                  }
    
                  // Determine text alignment based on column field
                  let textAlign = "";
                  if (
                    column.field === "Quantity" ||
                    column.field === "MRP" ||
                    column.field === "Price" ||
                    column.field === "Discount" ||
                    column.field === "Tax" ||
                    column.field === "Total"
                  ) {
                    textAlign = "right";
                  } else if (column.field === "SNO") {
                    textAlign = "center";
                  }
                  // Check if the field is "Discount" or "Tax" and format as percentage
                  if (column.field === "Discount" || column.field === "Tax") {
                      cellValue = (parseFloat(cellValue) * 100).toFixed(2) + "%";
                  }
                  row +=
                    "<td style='text-align: " +
                    textAlign +
                    "'>" +
                    String(cellValue).toUpperCase() +
                    "</td>";
                }
              });
              row += "</tr>";
              printWindow.document.write(row);
            });
    
            printWindow.document.write("</tbody>");
    
            printWindow.document.write("</table>");

    
            // Render the total savings and total amount rows
            printWindow.document.write(
              '<table style="width: 100%; margin-top: 15px; border-collapse: collapse;">' +
                "<tr>" +
                '<td style="border: none; text-align: right; padding-bottom: 10px; font-weight: bold">TOTAL SAVINGS: ' +
                savings +
                "</td>" +
                "</tr>" +
                "<tr>" +
                '<td style="border: none; text-align: right; font-weight: bold">TOTAL AMOUNT: ' +
                totalAmount +
                "</td>" +
                "</tr>" +
                "</table>"
            );
    
            // Render the Cash received and change rows
            if (cashPaidRef.current.value !== "") {
              printWindow.document.write(
                '<table style="width: 100%; margin-top: 10px; border-collapse: collapse;">' +
                  "<tr>" +
                  '<td style="border: none; text-align: right; padding-bottom: 10px; font-weight: bold">CASH RECEIVED: ' +
                  `$${parseFloat(cashPaidRef.current.value).toFixed(2)}` +
                  "</td>" +
                  "</tr>" +
                  "<tr>" +
                  '<td style="border: none; text-align: right; font-weight: bold">CHANGE: ' +
                  balanceRef.current.innerHTML +
                  "</td>" +
                  "</tr>" +
                  "</table>"
              );
            }

          printWindow.document.write('<div style="width: 100%; padding: 10px; text-align: center;">' + '*************************************' + '</div>');


    
            // Items Sold
            printWindow.document.write(
              '<table style="width: 100%; border-collapse: collapse;">' +
                "<tr>" +
                '<td style="border: none; text-align: center; font-size: 30px;">ITEMS SOLD: ' +
                gridInstance.dataSource.length +
                "</td>" +
                "</tr>" +
                "</table>"
            );
    
            // Additional row elements
            printWindow.document.write('<div style="text-align:center;">');
            printWindow.document.write("<p>THANK YOU FOR SHOPPING WITH US!</p>");
            printWindow.document.write("</div>");
    
            printWindow.document.write('<div style="text-align:center;">');
            if (isDoorDelivery) {
            printWindow.document.write("<p>✦ MERCHANT COPY ✦</p>");
            }
            else {
            printWindow.document.write("<p>✦ CUSTOMER COPY ✦</p>");
            }
            printWindow.document.write("</div>");
            printWindow.document.write("</body></html>");
    
            printWindow.document.close();
    
            printWindow.print();
    
            if ("onafterprint" in printWindow) {
              printWindow.onafterprint = function () {
                printWindow.close();
              };
            }
          } else {
            console.error("Print window could not be opened.");
          }
        }
        if ((gridInstance.current.dataSource as any).length) {
          printTable(
            (gridInstance.current),
            "ABC SUPERMARKET",
            (document.getElementById("billNoInput") as HTMLInputElement).value,
            (document.getElementById("customerName") as HTMLInputElement).value,
            (document.getElementById("phone-input") as HTMLInputElement).value,
            (document.getElementById("customerAddress") as HTMLInputElement).value,
            formattedDateTime,
            (document.querySelector("#totalNetAmount") as HTMLElement).innerHTML,
            (document.querySelector("#yourSavings") as HTMLElement).innerHTML,
            isDoorDelivery,
          );
          clearData();
          setRefresh(!refresh);
        } else {
          alert("No items available to print");
        }
      };
      
      //Grid command column delete button - Click event.
      const commandClick = (args: any): void  => {
        const rowIndex = parseInt(
          args.target.closest("tr").getAttribute("data-rowindex"),
          10
        );
        gridInstance.current.selectRow(rowIndex);
        gridInstance.current.deleteRecord();
      };

    //Create, read, write , destroy template declation of productid, productname, quantity column

        //productID create, read, write, destroy
        let productIDInput: HTMLElement;
        let autocompleteIns: AutoComplete;

        //function to handle key up event of product id column - show add new row - input element of grid.
        const handleKeyUp = (event: KeyboardEvent) => {
          const target = event.target as HTMLInputElement;
          handleproductIDKeyup(target.value);
        };

        //function to handle key up event of product id column - show add new row - input element of grid.
        const handleproductIDKeyup = (value: string) => {
          // dialogInstance.current.hide();
          if (value.length === 4 && prevProductID !== value) {
            setTimeout(() => {
                prevProductID = value;
                const product = productData.find(
                    (item) => (item as any).ProductID === value
                );
                if (product) {
                    const isProductExists = (gridInstance.current.dataSource as any).some(
                        (item: any) => (item as any).ProductID === (product as any).ProductID
                    );
                    if (isProductExists) {
                        alert("Product has already been added.");
                        return;
                    }
                    let index =
                        (gridInstance.current.dataSource as any).length === 0
                            ? 0
                            : (gridInstance.current.dataSource as any).length - 1;
                    let editedRowIndex: any = (gridInstance as any).current.editModule.editModule.editRowIndex; 
                    if(!isNullOrUndefined(editedRowIndex)) {
                      updateRecord(product, editedRowIndex);
                    } else {
                      gridInstance.current.addRecord(product, index);
                    }
                    return;
                } else {
                    alert("No product found with the provided Product ID");
                    return;
                }
            }, 300); // Delay of 500ms to wait for the user to type 5 digits
          }
        };

        const updateRecord = (product: any, editedRowIndex: any) =>{
          (document.getElementById(gridInstance.current.element.id + 'ProductID') as any).value = product.ProductID;
          (document.getElementById(gridInstance.current.element.id + 'ProductName') as any).value = product.ProductName;
          (document.getElementById(gridInstance.current.element.id + 'Price') as any).value = product.Price;
          (document.getElementById(gridInstance.current.element.id + 'MRP') as any).value = product.MRP;
          (document.getElementById(gridInstance.current.element.id + 'Discount') as any).value = product.Discount;
          (document.getElementById(gridInstance.current.element.id + 'Tax') as any).value = product.Tax;
          (document.getElementById(gridInstance.current.element.id + 'Total') as any).value = product.Total;
          (gridInstance as any).current.dataSource[editedRowIndex] = product;
          setTimeout(() => {
            gridInstance.current.editModule.startEdit(gridInstance.current.getRowByIndex(editedRowIndex) as HTMLTableRowElement);
            const ele = (gridInstance.current
              .getContent()
              .querySelectorAll(".e-editedrow .e-rowcell")[4]
              .querySelector(".e-textbox") as HTMLInputElement);
            ele.value = "";
            ele.focus();
            (gridInstance.current
              .getContent()
              .querySelectorAll(".e-editedrow .e-rowcell")[1]
              .querySelector(".e-textbox") as any).value = editedRowIndex + 1;
          }, 0)
        }

        const createProductIDFn = () => {
          productIDInput = document.createElement("input");
          return productIDInput;
        };
      
        const destroyProductIDFn = () => {
          if (autocompleteIns && productIDInput) {
            autocompleteIns.destroy();
            productIDInput.removeEventListener("keyup", handleKeyUp); // Remove event listener
          }
        };
      
        const readProductIDFn = (args: any) => {
            return args.value;
        };

        const writeProductIDFn = (args: any) => {
          autocompleteIns = new AutoComplete({
            dataSource: productData.map(product => ({ ProductID: (product as any).ProductID, ProductName: (product as any).ProductName })), // Provide your data source
            fields: { value: 'ProductID' },
            value: args.rowData[args.column.field],
            itemTemplate: "<table style='border-collapse: collapse; border: 1px solid rgba(var(--color-sf-outline-variant));'><tr><td style='width: 30px; border: 1px solid rgba(var(--color-sf-outline-variant)); padding: 2px;'>${ProductID}</td><td style='width: 70px; border: 1px solid rgba(var(--color-sf-outline-variant)); padding: 2px;'>${ProductName}</td></tr></table>",
            suggestionCount: productData.length,
            placeholder: "Enter product id",
            floatLabelType: "Never",
            select: (e) => {
            handleproductIDKeyup(e.item.dataset.value);
          }
        });
        autocompleteIns.appendTo(productIDInput);
        productIDInput.addEventListener("keyup", handleKeyUp);
        };
        
        //productname create, read, write, destroy
        let productNameInput: HTMLElement;
        let productNameTextBoxIns: TextBox;
        
        //Function to handle change event of product name input in product name column - add new row of grid. 
        const handleproductNameKeyup = (event: Event) => {
          const target = event.target as HTMLInputElement;
          if (target.value.length > 0 && prevProductName !== target.value) {
            setTimeout(() => {
              prevProductName = target.value;
              if (
                dialogInstance.current.element &&
                dialogInstance.current.element.style.display === ""
              ) {
                dialogInstance.current.show();
              }
              (productSearchGridInstance.current as any).search(target.value);
              (
                (productSearchGridInstance.current as any).element.querySelector(
                  "#" + (productSearchGridInstance.current as any).element.id + "_searchbar"
                ) as HTMLElement
              ).focus();
            }, 1000); // Delay of 700ms to wait for the user to type and for search to trigger
          }
        };

        const createProductNameFn = () => {
          productNameInput = document.createElement("input");
          return productNameInput;
        };
      
        const destroyProductNameFn = () => {
          if (productNameTextBoxIns && productNameInput) {
            // productNameTextBoxIns.destroy();
            productNameInput.removeEventListener("keyup", handleproductNameKeyup); // Remove event listener
          }
        };
      
        const readProductNameFn = (args:any) => {
            return args.value;
        };
      
        const writeProductNameFn = (args: any) => {
          productNameTextBoxIns = new TextBox({
            value: args.rowData[args.column.field],
            placeholder: "Enter product name",
            floatLabelType: "Never",
          });
          productNameTextBoxIns.appendTo(productNameInput);
          productNameInput.addEventListener("keyup", handleproductNameKeyup);
        };
        
        //quantity create, read, write, destroy
        let quantityInput: HTMLElement;
        let quantityTextBoxIns: TextBox;

        //Function to calculate total amount and update the same in total amount card component.
        const calculateTotal = (value: number): number => {
          if(gridInstance.current.getContent().querySelectorAll(".e-editedrow .e-rowcell").length) {
            const price = parseFloat(
              (gridInstance.current
                .getContent()
                .querySelectorAll(".e-editedrow .e-rowcell")[6]
                .querySelector(".e-input") as HTMLInputElement).value
            );
            const discount = parseFloat(
              (gridInstance.current
                .getContent()
                .querySelectorAll(".e-editedrow .e-rowcell")[7]
                .querySelector(".e-input") as HTMLInputElement).value
            );
            const tax = parseFloat(
              (gridInstance.current
                .getContent()
                .querySelectorAll(".e-editedrow .e-rowcell")[8]
                .querySelector(".e-input") as HTMLInputElement).value
            );
            return (value * price) - (value * discount) + (value * price * tax);
          }
        };

        //function to handle key up event of product quantity column - show add new row - input element of grid.
        const handleproductQuantityKeyup = (event: Event) => {
          if ((event.target as HTMLInputElement).value && !isNaN(parseFloat((event.target as HTMLInputElement).value)) &&
            gridInstance.current.getContent().querySelectorAll(".e-editedrow .e-rowcell").length) {
            const total = calculateTotal(
              parseFloat((event.target as HTMLInputElement).value)
            );
            (gridInstance.current
            .getContent().querySelectorAll(".e-editedrow .e-rowcell")[9]
            .querySelector(".e-input") as HTMLInputElement).value = total.toFixed(2);
          }
        };
      
        const createQuantityFn = () => {
          quantityInput = document.createElement("input");
          return quantityInput;
        };
      
        const destroyQuantityFn = () => {
          if (quantityTextBoxIns && quantityInput) {
            quantityInput.removeEventListener("keyup", handleproductQuantityKeyup); // Remove event listener
          }
        };
      
        const readQuantityFn = () => {
          if (quantityTextBoxIns) {
            return quantityTextBoxIns.value;
          }
          return "";
        };
      
        const writeQuantityFn = (args: any) => {
          quantityTextBoxIns = new TextBox({
            value: args.rowData[args.column.field],
            placeholder: "Enter quantity",
            floatLabelType: "Never",
            change: function (args) {},
          });
          quantityTextBoxIns.appendTo(quantityInput);
          quantityTextBoxIns.element.setAttribute("style", "text-align: right;");
          quantityInput.addEventListener("keyup", handleproductQuantityKeyup);
        };
    
    //Product search grid Events.
      //Row selected event
      const rowSelected = (): void => {
        let newItems: object[] = (productSearchGridInstance.current as any).getSelectedRecords();
          // Check for duplicate items based on ProductID
          const duplicateItems = newItems.filter((item) =>
            (gridInstance.current.dataSource as any[]).some(
              (existingItem) => existingItem.ProductID === (item as any).ProductID
            )
          );
          if (duplicateItems.length > 0) {
            // Display an alert for each duplicate item found
            productSearchGridInstance.current.clearSelection();
            alert(`Product already exists.`);
          } else {
            // Add new items to the dataSource if no duplicates found
            if (newItems.length > 0) {
              let index =
                (gridInstance.current.dataSource as any).length === 0
                  ? 0
                  : (gridInstance.current.dataSource as any).length - 1;
              const editedRowIndex = (gridInstance as any).current.editModule.editModule.editRowIndex;
              if(!isNullOrUndefined(editedRowIndex)) {
                updateRecord(newItems[0], editedRowIndex);
                productSearchGridInstance.current.clearSelection();
                dialogInstance.current.hide();
              } else {
                gridInstance.current.addRecord(...newItems, index);
              }
            }
          }
      };

      //To perform onkeyup search in productsearch grid - created event.
      const created = () => {
        document.getElementById(productSearchGridInstance.current.element.id + "_searchbar")!.addEventListener('keyup', (event) => {
            productSearchGridInstance.current.search((event.target as any).value);
        });
      };

    //Dynamic Dialog content rendering functions

      //Function to render Payment confirmation dialog popup.
      const renderPaymentConfimation = (): void => {
        setIsPrintButtonVisible(true);
        setIsSaveButtonVisible(false);
        cashCalculatorRef.current.style.display = "none";
        newCustomerFormRef.current.style.display = 'none';
        (
          confirmationDialog.current.element.querySelector(
            "#cashorupi"
          ) as HTMLElement
        ).style.display = "block";
        confirmationDialog.current.show();
      };

      // Function to render cash payment dialog with calculator element inputs.
      const renderCashCalculator = (): void => {
        cashCalculatorRef.current.style.display = "block";
        setIsPrintButtonVisible(true);
        setIsSaveButtonVisible(false);
        (
          confirmationDialog.current.element.querySelector(
            "#cashorupi"
          ) as HTMLElement
        ).style.display = "none";
        newCustomerFormRef.current.style.display = 'none';
        cashPaidRef.current.value = "";
        balanceRef.current.innerHTML = "$ 0.00";
        cashCalculatorRef.current.querySelector("#totalAmount").innerHTML = (
          document.querySelector("#totalNetAmount") as HTMLElement
        ).innerHTML;
        confirmationDialog.current.show();
      };

      //Function to handle change event of the amount paid by customer - cash input of cash calculator.
      const handleCashPaidChange = () => {
        const paidAmount = parseFloat(
          cashPaidRef.current.value === "" ? "0" : cashPaidRef.current.value
        );
        const totalAmount = parseFloat(
          cashCalculatorRef.current
            .querySelector("#totalAmount")
            .innerHTML.replace(/[$,]/g, "")
        );
        // Update balance
        const balance = paidAmount - totalAmount;
        balanceRef.current.innerHTML = `$${balance.toFixed(2)}`;
        balanceAmount = balanceRef.current.textContent;
        cashPaidAmount = `$${parseFloat(cashPaidRef.current.value).toFixed(2)}`;
      };

    //on click funtion to change and set the delivery type in delivery type button
    const onClickToggle = (): void => {
      setDeliveryType(prevType =>
          prevType === "Take Away" ? "Door Delivery" : "Take Away"
      );
    };

    // Function to remove un released memory from global variables and reset state values.
    function clearData(): void {
      (document.querySelector("#totalItems") as HTMLElement).innerHTML = "0";
      (document.querySelector("#yourSavings") as HTMLElement).innerHTML = "$0";
      (document.querySelector("#totalNetAmount") as HTMLElement).innerHTML = "$0";
      customerIDRef.current.value = "";
      customerNameRef.current.value = "";
      customerAddressRef.current.value = "";
      customerPhoneRef.current.value = "";
      prevProductID = "";
      prevProductName = "";
      setDeliveryType('Take Away');
    }
    
    //Primary Grid component - Declaration to prevent re-rener on unwanted state changes.
    const MemorizedGridComponent: any = React.useMemo(
      () => (
        <GridComponent
          ref={gridInstance}
          emptyRecordTemplate={(): any => null}
          gridLines="Both"
          height="250px"
          width='100%'
          rowHeight={15}
          textWrapSettings={wrapSettings}
          dataSource={[]}
          actionComplete={actionComplete}
          selectionSettings={selectionSettings}
          actionBegin={actionBegin}
          toolbar={toolbarOptions}
          allowSorting={true}
          beforePrint={beforePrint}
          editSettings={editSettings}
          commandClick={commandClick}
          created={createdGrid}
        >
          <ColumnsDirective>
            <ColumnDirective
              type="checkbox"
              width="5%"
              textAlign="Center"
            ></ColumnDirective>
            <ColumnDirective field="SNO" headerText="SNO" width="10%" allowEditing={false} />
            <ColumnDirective
              field="ProductID"
              isPrimaryKey={true}
              headerText="Product ID"
              width="18%"
              edit={{
                create: createProductIDFn,
                read: readProductIDFn,
                write: writeProductIDFn,
                destroy: destroyProductIDFn,
              }}
              validationRules={idRules}
              textAlign="Left"
            ></ColumnDirective>
            <ColumnDirective
              field="ProductName"
              headerText="Product Name"
              width="22%"
              edit={{
                create: createProductNameFn,
                read: readProductNameFn,
                write: writeProductNameFn,
                destroy: destroyProductNameFn,
              }}
              validationRules={productRule}
            ></ColumnDirective>
            <ColumnDirective
              field="Quantity"
              headerText="Quantity"
              width="18%"
              edit={{
                create: createQuantityFn,
                read: readQuantityFn,
                write: writeQuantityFn,
                destroy: destroyQuantityFn,
              }}
              validationRules={qtyRule}
              textAlign="Right"
            ></ColumnDirective>
            <ColumnDirective
              field="MRP"
              defaultValue="0.00"
              width="15%"
              format="C2"
              textAlign="Right"
              headerText="MRP"
              allowEditing={false}
            />
            <ColumnDirective
              field="Price"
              defaultValue="0.00"
              width="15%"
              format="C2"
              textAlign="Right"
              headerText="Price"
              allowEditing={false}
            />
            <ColumnDirective
              field="Discount"
              headerText="Discount"
              width="15%"
              textAlign="Right"
              format="P1"
              allowEditing={false}
            />
            <ColumnDirective
              field="Tax"
              headerText="Tax Rate"
              width="15%"
              format="P2"
              textAlign="Right"
              allowEditing={false}
            />
            <ColumnDirective
              field="Total"
              width="15%"
              format="C2"
              textAlign="Right"
              allowEditing={false}
              headerText="Total"
            />
            <ColumnDirective
              headerText="Manage Items"
              width="18%"
              textAlign="Center"
              commands={commands}
            ></ColumnDirective>
          </ColumnsDirective>
          <Inject
            services={[Selection, Toolbar, Edit, Sort, CommandColumn]}
          />
        </GridComponent>
      ),
      [refresh]
    );

    return (
      <div>
      <div className="input-container-title">ABC SUPERMARKET POINT OF SALE (POS)</div>
        {/* Customer details Header element */}
        <div className="header" style={{marginTop: "15px", height: '20%'}}>
          <table className="header-table" style={{marginLeft: '40px'}}>
          <tr className="input-container billno"><td>
            <label>Bill Number:</label></td><td>
            <TextBoxComponent
              id="billNoInput"
              type="text"
              readOnly
            />
          </td></tr>
          <tr className="input-container custid"><td>
            <label>Customer ID:</label></td><td>
            <AutoCompleteComponent
                id="customerID"
                placeholder="Enter customer id"
                dataSource={customerDatabase.map(customer => (customer as any).id)}
                ref={customerIDRef}
            />
            <ButtonComponent
              ref={plusButtonRef}
              title="Add New Customer"
              onClick={addNewCustomer}
              style={{ marginLeft: "4px" }}
            >
              +
            </ButtonComponent>
          </td></tr></table>
          <table className="header-table">
          <tr className="input-container custname"><td>
            <label>Customer Name:</label></td><td>
            <TextBoxComponent
              type="text"
              id="customerName"
              ref={customerNameRef}
              placeholder="Customer Name"
              readOnly
            />
          </td></tr>
          <tr className="input-container phone"><td>
            <label>Phone Number:</label></td><td>
            <MaskedTextBoxComponent
              id="phone-input"
              ref={customerPhoneRef}
              mask="(999) 999-9999"
              placeholder="(999) 999-9999"
              readOnly
            />
          </td></tr></table>
          <table className="header-table">
          <tr className="input-container custaddress"><td>
            <label>Customer Address:</label></td><td>
            <TextAreaComponent
              id="customerAddress"
              value={""}
              ref={customerAddressRef}
              placeholder="Customer Address"
              readOnly
            />
          </td></tr>
          <tr className="input-container datepicker"><td>
            <label>Date:</label></td><td>
            <DateTimePickerComponent
              id="date-picker"
              ref={datePicker}
              value={currentDateTime}
              format="MM/dd/yyyy hh:mm:ss a"
              readOnly
            />
          </td></tr></table>
        </div>
        {/* Main Content of the Body - Primary Grid and Vertical Amount details Card components */}
        <div className="primary-container" style={{marginTop: "15px", height: '50%'}}>
          {MemorizedGridComponent}

          {/* Product search by its name - Dialog popup */}
          <DialogComponent
            id="defaultdialog"
            ref={dialogInstance}
            visible={false}
            showCloseIcon={true}
            animationSettings={animationSettings}
            height={500}
            width={700}
            header="Product search"
            isModal={true}
          >
            
            {/* Product search by its name - Search grid render within the dialog component */}
            <GridComponent
              ref={productSearchGridInstance}
              dataSource={productData}
              selectionSettings={searchGridSelectionSettings}
              rowSelected={rowSelected}
              toolbar={searchGridToolbarOptions}
              created={created}
            >
              <ColumnsDirective>
                <ColumnDirective
                  field="ProductID"
                  headerText="Product ID"
                  width="180"
                />
                <ColumnDirective
                  field="ProductName"
                  headerText="Product Name"
                  width="150"
                />
                <ColumnDirective field="MRP" headerText="MRP" width="150" />
                <ColumnDirective
                  field="Price"
                  headerText="Price"
                  width="120"
                  textAlign="Right"
                />
              </ColumnsDirective>
              <Inject
                services={[Selection, Toolbar, Edit, Sort, CommandColumn]}
              />
            </GridComponent>
          </DialogComponent>

          {/* Vertical Card components - Total Amount, Savings and Quantity details*/}
          <div className="control-pane amount">
            <div className="control-section card-control-section vertical_card_layout">
              <div className="e-card-resize-container">
                <div className="row">
                  <div className="row card-layout" style={{height: '330px'}}>
                    <div className="col-xs-6 col-sm-6 col-sm-4 ">
                      <div className="e-card" id="poscards">
                        <div className="e-card-header">
                          <div className="e-card-header-caption">
                            <div className="e-card-header-title">Total Items</div>
                          </div>
                        </div>
                        <div className="e-card-actions">
                          <div className="e-card-btn-txt" id="totalItems">
                            0
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-6 col-sm-6 col-sm-4 ">
                      <div className="e-card" id="poscards">
                        <div className="e-card-header">
                          <div className="e-card-header-caption">
                            <div className="e-card-header-title">
                              Your Savings
                            </div>
                          </div>
                        </div>
                        <div className="e-card-actions">
                          <div className="e-card-btn-txt" id="yourSavings">
                            $0
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-6 col-sm-6 col-sm-4 ">
                      <div className="e-card" id="poscards">
                        <div className="e-card-header">
                          <div className="e-card-header-caption">
                            <div className="e-card-header-title">
                              Total Net Amount
                            </div>
                          </div>
                        </div>
                        <div className="e-card-actions">
                          <div className="e-card-btn-txt" id="totalNetAmount">
                            $0
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Card components - Delivery type, Payment type Buttons*/}
        <div className="control-pane payment" style={{marginTop: "15px", height: '20%'}}>
          <div className="control-section card-control-section vertical_card_layout">
            <div className="e-card-resize-container">
              <div className="row">
                <div className="row card-layout">
                {/* Horizontal Card components - Delivery type Button*/}
                  <div className="col-xs-3 col-sm-3 ">
                    <div className="e-card" id="poscards">
                      <div className="e-card-actions">
                        <div className="e-card-btn-txt" id="deliverOptionDiv" style={{ background: 'linear-gradient(to right, rgb(251, 146, 60), rgb(224 212 55) 50%, rgb(251, 146, 60))'}}>
                          <ButtonComponent
                            ref={buttonRef}
                            onClick={onClickToggle}
                            isToggle={true}
                            title="Toggle Delivery type"
                          >
                            <span>Delivery Type:</span> &nbsp;
                            <span ref={deliverytypeRef} style={{ color: deliveryType === "Take Away" ? "rgb(8 168 67)" : "red" }}>
                            {deliveryType}
                            </span>
                          </ButtonComponent>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Horizontal Card components - Card payment Button*/}
                  <div className="col-xs-3 col-sm-3 ">
                    <div className="e-card" id="poscards">
                      <div className="e-card-actions">
                        <div className="e-card-btn-txt" id="cardPayButtonDiv" style={{ background: 'linear-gradient(to right, rgb(16, 18, 240), rgb(141 149 232) 50%, rgb(16, 18, 240))'}}>
                          <ButtonComponent
                            id="cardPayButton"
                            title="Click to enter card payment"
                            onClick={renderPaymentConfimation}
                          >
                            <img
                              src="./Images/Card.svg"
                              alt="Card"
                              className="payment-icon"
                            />{" "}
                            <span>Card Payment</span>
                          </ButtonComponent>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Horizontal Card components - UPI payment Button*/}
                  <div className="col-xs-3 col-sm-3 ">
                    <div className="e-card" id="poscards">
                      <div className="e-card-actions">
                        <div className="e-card-btn-txt" id="UPIPayButtondiv" style={{ background: 'linear-gradient(to right, #15803d, #55e189 50%, #15803d)'}}>
                          <ButtonComponent
                            id="UPIPayButton"
                            title="Click to enter UPI payment"
                            onClick={renderPaymentConfimation}
                          >
                            <img
                              src="./Images/UPI.svg"
                              alt="UPI"
                              className="payment-icon"
                            />{" "}
                            <span>UPI Payment</span>
                          </ButtonComponent>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Horizontal Card components - Cash payment Button*/}
                  <div className="col-xs-3 col-sm-3 ">
                    <div className="e-card" id="poscards">
                      <div className="e-card-actions">
                        <div className="e-card-btn-txt" id="totalNetAmount" style={{ background: 'linear-gradient(to right, rgb(251 60 60), rgb(239 179 87) 50%, rgb(251 60 60))'}}>
                          <ButtonComponent
                            id="cashPayButton"
                            title="Click to enter cash payment"
                            onClick={renderCashCalculator}
                          >
                            {" "}
                            <img
                              src="./Images/Cash.svg"
                              alt="Cash"
                              className="payment-icon"
                            />{" "}
                            <span>Cash</span>
                          </ButtonComponent>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Dialog to render - confirmation dialog for printing the bill / Add new customer dialog*/}
        <div id="targetElement2">
          <DialogComponent
            id="confirmationDialog"
            isModal={true}
            buttons={buttons}
            header="Payment Confirmation"
            width="500px"
            style={{fontSize: '16px'}}
            ref={confirmationDialog}
            target="#targetElement2"
            visible={false}
            showCloseIcon={true}
            animationSettings={animationSettings}
          >
            {/*Add new customer dialog content*/}
            <div
              ref={newCustomerFormRef}
              id="newCustomerForm"
              style={{ display: "none" }}
            >
              <form>
                    <div className="input-container" style={{ marginBottom: "5px" }}>
                    <label htmlFor="customerName">Customer Name</label>
                    <TextBoxComponent
                        id="customerName"
                        ref={newCustomerNameRef}
                        placeholder="Enter customer name"
                    />
                    </div>
                    <div className="input-container" style={{ marginBottom: "5px" }}>
                    <label htmlFor="phone-input">Phone No</label>
                    <MaskedTextBoxComponent
                        id="phone-input"
                        ref={newCustomerPhoneRef}
                        mask="(999) 999-9999"
                        placeholder="(999) 999-9999"
                    />
                    </div>
                    <div className="input-container" style={{ marginBottom: "5px" }}>
                    <label htmlFor="customerAddress">Address</label>
                    <TextAreaComponent
                        id="customerAddress"
                        width='100%'
                        value={""}
                        ref={newCustomerAddressRef}
                        placeholder="Enter customer address"
                    />
                    </div>
                </form>
            </div>

            {/*Cash payment - dialog content*/}
            <div
              ref={cashCalculatorRef}
              id="cashCalculator"
              style={{ display: "none" }}
            >
              <table>
                <tbody>
                  <tr>
                    <td>Total amount -</td>
                    <td id="totalAmount">{0}</td>
                  </tr>
                  <tr>
                    <td>Cash paid -</td>
                    <td>
                      <input
                        type="number"
                        ref={cashPaidRef}
                        onChange={handleCashPaidChange}
                        placeholder="Enter cash paid"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Balance -</td>
                    <td ref={balanceRef}>$ 0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/*UPI / Card payment - dialog content*/}
            <span></span>
            <div id="cashorupi">Press Enter to confirm payment was done</div>
          </DialogComponent>
        </div>
      </div>
    );
  }
  export default App;
  