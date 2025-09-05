using GuestMeetUp.BLL;
using GuestMeetUp.Models;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Data;
using System.Diagnostics.Eventing.Reader;

namespace GuestMeetUp.Controllers
{
    public class HomeController : Controller
    {
        int guestIdForRef = 0;
        private readonly ILogger<HomeController> _logger;
        private readonly IConfiguration _configuration;
        public HomeController(ILogger<HomeController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        //public string GuestOrgName = "";
        public IActionResult Index(int returnCode = -1)
        {
            var Obj = new GuestInfoModel();
            string[] rawUrl = Request.GetDisplayUrl().ToString().Split("?urlData=");
            if (string.IsNullOrEmpty(rawUrl[0]))
            {
                Obj.CollegeShortName = "";
                Obj.GuestType = "";
            }

            Obj.CollegeShortName = rawUrl[1];
            //GuestOrgName = rawUrl[1];
            Obj.GuestIdProof = new List<SelectListItem> {
               new SelectListItem { Value = "-1", Text = "Select"},
               new SelectListItem { Value = "Aadhaar", Text = "Aadhaar"},
               new SelectListItem { Value = "Driving Licence", Text = "Driving Licence"},
               new SelectListItem { Value = "Voter Id", Text = "Voter Id"},
            };
            Obj.GuestSpouseIdProof = new List<SelectListItem>
            {
               new SelectListItem { Value = "-1", Text = "Select"},
               new SelectListItem { Value = "Aadhaar", Text = "Aadhaar"},
               new SelectListItem { Value = "Driving Licence", Text = "Driving Licence"},
               new SelectListItem { Value = "Voter Id", Text = "Voter Id"},
            };
            TempData["SuccessMessage"] = null;
            return View(Obj);
        }

        [HttpPost]
        public IActionResult Index(GuestInfoModel guestInfoModel)
        {
            SaveFormRequest svRequest = new SaveFormRequest(_configuration);
            string ClgShortName = string.Empty;
            if (guestInfoModel.CollegeShortName != null)
            {
                ClgShortName = _configuration.GetValue<string>("CollegeOrgShortName:" + guestInfoModel.CollegeShortName);
            }
            else
            {
                ClgShortName = "";
                guestInfoModel.GuestType = "";
            }

            string SpouseName = guestInfoModel.GSpouse.SpouseName ?? string.Empty;
            string GuestAddress = guestInfoModel.Address ?? string.Empty;
            int GuestSpouseBirth = string.IsNullOrEmpty(SpouseName) ? 0 : guestInfoModel.GSpouse.SpousBirthYear;
            string GSpouseMealType = string.IsNullOrEmpty(SpouseName) ? string.Empty : guestInfoModel.GSpouse.SpousMealType ?? string.Empty;
            string otherRequest = guestInfoModel.OtherRequest ?? string.Empty;
            string guestSpouseIdType = guestInfoModel.GuestSpouseProof ?? string.Empty;
            // Update guestInfoModel properties
            guestInfoModel.GSpouse.SpouseName = SpouseName;
            guestInfoModel.GSpouse.SpousMealType = GSpouseMealType;
            guestInfoModel.GSpouse.SpousBirthYear = GuestSpouseBirth;
            guestInfoModel.Address = GuestAddress;
            guestInfoModel.GuestSpouseProof = guestSpouseIdType;
            guestInfoModel.GuestPhoto = "Photo";
            guestInfoModel.CollegeShortName = ClgShortName;
            //guestInfoModel.EventName = "AI Sparx";
            var fileStream = new MemoryStream();

            if (guestInfoModel.userfile != null && guestInfoModel.userfile.Length > 0)
                guestInfoModel.userfile.CopyTo(fileStream);

            var fileBytes = fileStream.ToArray();
            guestInfoModel.FileData = fileBytes;



            var gustFileStream = new MemoryStream();

            if (guestInfoModel.userIdProof != null && guestInfoModel.userIdProof.Length > 0)
                guestInfoModel.userIdProof.CopyTo(gustFileStream);

            var fileGuestIdBytes = gustFileStream.ToArray();
            guestInfoModel.ProofIdFileData = fileGuestIdBytes;


            //==================
            if (GuestSpouseBirth != 0 && guestInfoModel.userSpouseIdProof == null)
            {
                TempData["ErrorMessage"] = "Some fields are missing!";
                return RedirectToAction("Index", "Home", new { returnCode = 0 });
            }
            if (SpouseName != "" && guestInfoModel.userSpouseIdProof.Length > 0)
            {
                var guestSpouseStream = new MemoryStream();

                if (guestInfoModel.userSpouseIdProof != null && guestInfoModel.userSpouseIdProof.Length > 0)
                    guestInfoModel.userSpouseIdProof.CopyTo(guestSpouseStream);

                var fileGuestSpouseIdBytes = guestSpouseStream.ToArray();
                guestInfoModel.ProofIdSpouseFileData = fileGuestSpouseIdBytes;
            }
            bool chkExistPhone = svRequest.checkPhoneNumber(guestInfoModel.PhoneNumber);

            DataTable dtGuestFaculty = new DataTable();
           // DataTable dtGuestStudent = new DataTable();
            dtGuestFaculty = svRequest.GuestCheckType(guestInfoModel.GuestType, guestInfoModel.CollegeShortName);
            int compCond = 0;
            int compCondSaved = 0;


            if (guestInfoModel.GuestType.ToString() == "Faculty")
            {
                compCond = 1;
                compCondSaved = Convert.ToInt32(dtGuestFaculty.Rows[0]["Faculty"]);
            }
            else if (guestInfoModel.GuestType.ToString() == "Student")
            {
                compCond = ClgShortName == "ABESIT" ? 10 : 6;
                compCondSaved = Convert.ToInt32(dtGuestFaculty.Rows[0]["Student"]);
            }
            else
            {
                compCond = 1;
                compCondSaved = 0;
            }
            if (compCondSaved < compCond)
            {
                int saveGlobal = svRequest.SaveOnlineRequest(guestInfoModel);
                //int newGuestId = 2425100 +
                guestIdForRef = 2425100 + saveGlobal;
                if (saveGlobal != 0)
                {
                    svRequest.SaveGuestPhoto(guestInfoModel, saveGlobal, 1);
                    svRequest.SaveGuestPhoto(guestInfoModel, saveGlobal, 2);
                    if (GuestSpouseBirth != 0)
                    {
                        svRequest.SaveGuestPhoto(guestInfoModel, saveGlobal, 3);

                    }

                    TempData["SuccessMessage"] = "Registered successfully!";
                    return RedirectToAction("ThankYou", "Home", new { returnCode = guestIdForRef });
                }
            }
            else
            {
                //TempData["ErrorMessage"] = "You are not allowed for registration!";
                return RedirectToAction("NotAllowed", "Home", new { returnCode = 0 });
            }



            return RedirectToAction("ThankYou", "Home", new { returnCode = guestIdForRef });
        }

        // [HttpPost]
        public IActionResult ThankYou(int returnCode = 0)
        {
            thankYouModel obj = new thankYouModel
            {
                Id = returnCode,
            };
            TempData["SuccessMessage"] = null;
            return View(obj);
        }

        public IActionResult NotAllowed(int returnCode = 0)
        {

            TempData["SuccessMessage"] = null;
            return View();
        }


        public IActionResult Event()
        {
            return View();
        }
    }
}