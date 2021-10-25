var currencies = ["usd", "eur", "aud", "cad", "chf", "nzd", "bgn"];
var current;
var rates = [];
var promises = [];
var lognestArray = [];
var lognestlength = 0;
var date = new Date().toISOString().split("T")[0];
$(function () {
  countryList();
  $("#currency-list").change(currencyRate);
  handler();
});

function countryList() {
  currencies.forEach((currency) => {
    $("#currency-list").append(
      `<option value="${currency}"> ${currency.toUpperCase()} </option>`
    );
  });
  $("#currency-list option[value='usd']").prop("selected", true);
}

function handler() {
  const cached = localStorage.getItem("data");
  const data = JSON.parse(cached);
  if (!data) {
    getRates();
    return;
  }
  if (date === data[0].data.date) {
    rates = data;
    currencyRate();
  }
}

// GET RATES FOR EVERY POSSIBLE PAIR
function getRates() {
  localStorage.removeItem("data");
  currencies.forEach((c) => {
    for (let i = 0; i < currencies.length; i++) {
      if (c !== currencies[i]) {
        var ajax = $.ajax({
          url: `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${c}/${currencies[i]}.json`,
          dataType: "json",
        });
        ajax.done(function (data) {
          rates.push({ c, data });
        });
        promises.push(ajax);
      }
    }
  });
  $.when.apply(null, promises).done(function () {
    currencyRate();
    localStorage.setItem("data", JSON.stringify(rates));
  });
}

function currencyRate() {
  current = $("#currency-list").val();
  lognestArray = [];
  var count1 = 0;
  var count2 = 0;
  var count3 = 0;

  if (rates.length > 0) {
    $(".empty").empty();
    var forCurrency = rates.filter(
      (currency) => currency.c === current || currency.data[`${current}`]
    );
    $("#title").text(`${current.toUpperCase()}`);
    forCurrency.forEach((e) => {
      let pair = Object.keys(e.data)[1];
      let rate = Object.values(e.data)[1];
      lognestArray.push({
        pair: `${e.c.toUpperCase()}/${pair.toUpperCase()}`,
        rate: rate,
      });
      if (rate < 1) {
        count1++;
        $("#g-1").append(`
            <tr>
            <td>${count1}</td>
            <td>${e.c.toUpperCase()}/${pair.toUpperCase()}</td>
            <td>${rate}</td>
            </tr>`);
      }
      if (rate >= 1 && rate <= 1.5) {
        count2++;
        $("#g-2").append(`
        <tr>
        <td>${count2}</td>
        <td>${e.c.toUpperCase()}/${pair.toUpperCase()}</td>
        <td>${rate}</td>
        </tr>`);
      }
      if (rate >= 1.5) {
        count3++;
        $("#g-3").append(`
        <tr>
        <td>${count3}</td>
        <td>${e.c.toUpperCase()}/${pair.toUpperCase()}</td>
        <td>${rate}</td>
        </tr>`);
      }
    });
    $("#g-1").append(`<td>Total Count: </td><td>${count1}</td>`);
    $("#g-2").append(`<td>Total Count: </td><td>${count2}</td>`);
    $("#g-3").append(`<td>Total Count: </td><td>${count3}</td>`);

    // GET LONGEST ARRAY
    let min = Math.min.apply(
      null,
      lognestArray.map((e) => {
        return e.rate;
      })
    );
    let max = Math.max.apply(
      null,
      lognestArray.map((e) => {
        return e.rate;
      })
    );

    let arr1 = lognestArray.filter((el) => {
      return el.rate <= max - 0.5;
    });
    let arr2 = lognestArray.filter((el) => {
      return el.rate >= min + 0.5;
    });

    if (arr1.length > arr2.length) {
      lognestlength = arr1.length;
    } else {
      lognestlength = arr2.length;
    }
  }
  $("#longest-arr").text(`Longest Array: ${lognestlength}`);
}
