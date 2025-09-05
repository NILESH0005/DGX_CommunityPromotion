using GuestMeetUp.Models;
using System.Text;
using Microsoft.Data.SqlClient;
using System.Data;

namespace GuestMeetUp.BLL
{
    public class SaveFormRequest
    {
        private readonly IConfiguration _configuration;

        public SaveFormRequest(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public string GetGuestID()
        {
            string connectionString = _configuration.GetValue<string>("ConnectionStrings:DefaultConnection");

            using (SqlConnection con = new SqlConnection(connectionString))
            {
                string sqlQuery = "SELECT ISNULL(MAX(IdCode), 0) AS MaxIdCode FROM tblGuestEvent";

                using (SqlCommand cmd = new SqlCommand(sqlQuery, con))
                {
                    con.Open();

                    int maxIdCode = Convert.ToInt32(cmd.ExecuteScalar());

                    //int currentYear = 24;//DateTime.Now.Year;
                    //string currentMonth = "25";//DateTime.Now.Month.ToString("d2");
                    int newGuestId = 2425100 + maxIdCode + 1;
                    string guestID = newGuestId + "";//$"{currentYear}{currentMonth}{maxIdCode + 1:D3}";

                    return guestID + "|" + maxIdCode;
                }
            }
        }

        public bool checkPhoneNumber(string phoneNumber)
        {
            DataTable dt = new DataTable();
            var ConnectionString = _configuration.GetValue<string>("ConnectionStrings:DefaultConnection");
            SqlConnection con = new SqlConnection(ConnectionString);
            try
            {
                StringBuilder strQuery = new StringBuilder();
                strQuery.Clear();
                strQuery.Append(" select idCode from tblGuestEvent where isnull(delStatus,0)=0 and PhoneNumber=@PhoneNumber ");
                if (con.State != ConnectionState.Open)
                    con.Open();
                SqlCommand cmd = new SqlCommand(strQuery.ToString(), con);
                cmd.Parameters.AddWithValue("@PhoneNumber", phoneNumber);
                using (SqlDataAdapter a = new SqlDataAdapter(cmd))
                {
                    a.Fill(dt);
                }
                if (dt.Rows.Count > 0)
                    return false;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con.State != ConnectionState.Closed)
                    con.Close();
            }
            return true;
        }


        public void SaveGuestPhoto(GuestInfoModel guestInfoModel, int idCode, int PhotoUserType)
        {
            var ConnectionString = _configuration.GetValue<string>("ConnectionStrings:DefaultConnection");
            SqlConnection con = new SqlConnection(ConnectionString);
            try
            {
                // public int SaveGrievance(byte[] imageSizePhoto, int SizeSign, int idCode, string docTypePhoto, string UserName, string PSCat)
                byte[] imageSizePhoto = null;
                string docTypePhoto = "";
                string DocTypeUpload = "";
                if (PhotoUserType == 1)
                {
                    imageSizePhoto = guestInfoModel.FileData;
                    docTypePhoto = "Photo";
                    DocTypeUpload = guestInfoModel.userfile.ContentType;
                }
                else if (PhotoUserType == 2)
                {
                    imageSizePhoto = guestInfoModel.ProofIdFileData;
                    DocTypeUpload = guestInfoModel.userIdProof.ContentType;
                    docTypePhoto = "selfId";
                }
                else if (PhotoUserType == 3)
                {
                    imageSizePhoto = guestInfoModel.ProofIdSpouseFileData;
                    DocTypeUpload = guestInfoModel.userSpouseIdProof.ContentType;
                    docTypePhoto = "spouseId";
                }
                StringBuilder strQuery = new StringBuilder();
                strQuery.Clear();
                strQuery.Append(" INSERT INTO tblImageData (ImageRefName, Picture, MasterId, Category, formName, DocType, AuthAdd, AddOnDt, delStatus, tblRefId, tblRefName, refName) ");
                strQuery.Append(" VALUES (@ImageRefName, @Picture, @MasterId, @Category, @formName, @DocType, @AuthAdd, GETDATE(), 0, @tblRefId, @tblRefName, @refName); ");
                strQuery.Append(" SELECT ISNULL(MAX(IdCode), 0) AS MaxIdCode FROM tblGuestEvent "); // Add this line to get the last inserted ID

                if (con.State != ConnectionState.Open)
                    con.Open();

                SqlCommand cmd = new SqlCommand(strQuery.ToString(), con);
                cmd.Parameters.AddWithValue("@ImageRefName", docTypePhoto);
                cmd.Parameters.AddWithValue("@Picture", imageSizePhoto); // Adjust if necessary for binary data
                cmd.Parameters.AddWithValue("@MasterId", idCode); // Adjust if necessary
                cmd.Parameters.AddWithValue("@Category", "Guest");
                cmd.Parameters.AddWithValue("@formName", "Gril Guest Registration");
                cmd.Parameters.AddWithValue("@DocType", DocTypeUpload);
                cmd.Parameters.AddWithValue("@AuthAdd", "Guest");
                cmd.Parameters.AddWithValue("@tblRefId", idCode); // Adjust if necessary
                cmd.Parameters.AddWithValue("@tblRefName", "tblGuestEvent");
                cmd.Parameters.AddWithValue("@refName", docTypePhoto);

                int insertedId = Convert.ToInt32(cmd.ExecuteScalar()); // ExecuteScalar returns the first column of the first row in the result set
                //return insertedId + 1; // Return the newly inserted ID
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con.State == ConnectionState.Open)
                    con.Close();
            }
        }

        public DataTable GuestCheckType(string GuestType, string GuestOrgName)
        {
            DataTable dt = new DataTable();
            var ConnectionString = _configuration.GetValue<string>("ConnectionStrings:DefaultConnection");
            SqlConnection con = new SqlConnection(ConnectionString);
            try
            {
                StringBuilder strQuery = new StringBuilder();
                strQuery.Clear();
                strQuery.Append(" select ISNULL(SUM(CASE WHEN isnull(Category,'') = 'Faculty' then 1 else 0 end),0) Faculty,ISNULL(SUM(CASE WHEN isnull(Category,'') = 'Student' then 1 else 0 end),0) Student ");
                strQuery.Append(" from tblGuestEvent where isNull(delStatus,0) = 0 and Category = @Category  and CollegeOrgShortName =@CollegeOrgShortName ");
                //strQuery.Append(" select idCode from tblGuestEvent where isNull(delStatus,0) = 0 and Category = @Category  ");
                //strQuery.Append(" and CollegeOrgShortName =@CollegeOrgShortName  ");
                if (con.State != ConnectionState.Open)
                    con.Open();
                SqlCommand cmd = new SqlCommand(strQuery.ToString(), con);
                cmd.Parameters.AddWithValue("@Category", GuestType);
                cmd.Parameters.AddWithValue("@CollegeOrgShortName", GuestOrgName);
                using (SqlDataAdapter a = new SqlDataAdapter(cmd))
                {
                    a.Fill(dt);
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con.State != ConnectionState.Closed)
                    con.Close();
            }
            return dt;
        }

        public int SaveOnlineRequest(GuestInfoModel guestInfoModel)
        {
            var ConnectionString = _configuration.GetValue<string>("ConnectionStrings:DefaultConnection");
            SqlConnection con = new SqlConnection(ConnectionString);
            string guesId = GetGuestID();
            string[] guestInfoId = guesId.Split('|');
            try
            {
                StringBuilder strQuery = new StringBuilder();
                strQuery.Clear();
                strQuery.Append(" select count(isnull(IdCode,0)) as totalCount from tblGuestEvent ");
                strQuery.Append(" insert into tblGuestEvent(Name,BirthYear,Gender,EmailAddress,PhoneNumber,MealType,TransportRequired,Address, ");
                strQuery.Append(" SpouseName,SpouseBirthYear,SpouseMealType,AuthAdd,AddOnDt,delstatus,GuestId,guestProofIdType,guestSpouseProofIdType, ");
                strQuery.Append(" CollegeOrgName,Category,EventName,CollegeOrgShortName) values(@Name,@BirthYear,@Gender,@EmailAddress,@PhoneNumber, ");
                strQuery.Append(" @MealType,@TransportRequired,@Address,@SpouseName,@SpouseBirthYear,@SpouseMealType,'Guest',GETDATE(),0, ");
                strQuery.Append(" @GuestId,@guestProofIdType,@guestSpouseProofIdType,@CollegeOrgName,@Category,@EventName,@CollegeOrgShortName) ");
                strQuery.Append(" SELECT ISNULL(MAX(IdCode), 0) AS MaxIdCode FROM tblGuestEvent ");
                if (con.State != ConnectionState.Open)
                    con.Open();
                SqlCommand cmd = new SqlCommand(strQuery.ToString(), con);
                cmd.Parameters.AddWithValue("@Name", guestInfoModel.Name);
                cmd.Parameters.AddWithValue("@BirthYear", guestInfoModel.BirthYear);
                cmd.Parameters.AddWithValue("@Gender", guestInfoModel.Gender);
                cmd.Parameters.AddWithValue("@EmailAddress", guestInfoModel.EmailAddress);
                cmd.Parameters.AddWithValue("@PhoneNumber", guestInfoModel.PhoneNumber);
                cmd.Parameters.AddWithValue("@MealType", guestInfoModel.MealType);
                cmd.Parameters.AddWithValue("@TransportRequired", guestInfoModel.TransportRequired);
                cmd.Parameters.AddWithValue("@Address", guestInfoModel.Address);
                cmd.Parameters.AddWithValue("@SpouseName", guestInfoModel.GSpouse.SpouseName);
                cmd.Parameters.AddWithValue("@SpouseBirthYear", guestInfoModel.GSpouse.SpousBirthYear);
                cmd.Parameters.AddWithValue("@SpouseMealType", guestInfoModel.GSpouse.SpousMealType);
                cmd.Parameters.AddWithValue("@guestProofIdType", guestInfoModel.GuestProof);
                cmd.Parameters.AddWithValue("@guestSpouseProofIdType", guestInfoModel.GuestSpouseProof);
                cmd.Parameters.AddWithValue("@GuestId", guestInfoId[0]);
                cmd.Parameters.AddWithValue("@CollegeOrgName", guestInfoModel.CollegeOrgName);
                cmd.Parameters.AddWithValue("@Category", guestInfoModel.GuestType);
                cmd.Parameters.AddWithValue("@EventName", guestInfoModel.EventName);
                cmd.Parameters.AddWithValue("@CollegeOrgShortName", guestInfoModel.CollegeShortName);
                int insertedId = Convert.ToInt32(cmd.ExecuteScalar());
                return Convert.ToInt32(guestInfoId[1]) + 1;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con.State != ConnectionState.Closed)
                    con.Close();
            }
        }
    }
}
