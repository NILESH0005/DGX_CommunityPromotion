import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

export const useUnits = (submodule, fetchData, userToken) => {
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editedUnitData, setEditedUnitData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchData(
        `dropdown/getUnitsWithFiles/${submodule.SubModuleID}`,
        "GET",
        { "auth-token": userToken }
      );

      if (response?.success) {
        const validUnits = response.data.filter((unit) => unit);
        setUnits(validUnits);
        const filtered = validUnits.filter(
          (unit) => unit.SubModuleID === submodule.SubModuleID
        );
        setFilteredUnits(filtered);
      }
    } catch (err) {
      console.error("Error refetching units:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [submodule.SubModuleID, fetchData, userToken]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setEditedUnitData({
      UnitName: unit.UnitName,
      UnitDescription: unit.UnitDescription,
    });
  };

  const handleCancelEditUnit = () => {
    setEditingUnit(null);
    setEditedUnitData({});
  };

  const handleUpdateUnit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        UnitName: editedUnitData.UnitName,
        UnitDescription: editedUnitData.UnitDescription,
        SubModuleID: submodule.SubModuleID,
      };

      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const response = await fetchData(
        `lmsEdit/updateUnit/${editingUnit.UnitID}`,
        "POST",
        payload,
        headers
      );

      if (response?.success) {
        setUnits((prevUnits) =>
          prevUnits.map((unit) =>
            unit.UnitID === editingUnit.UnitID
              ? { ...unit, ...response.data }
              : unit
          )
        );

        setFilteredUnits((prevFilteredUnits) =>
          prevFilteredUnits.map((unit) =>
            unit.UnitID === editingUnit.UnitID
              ? { ...unit, ...response.data }
              : unit
          )
        );

        if (selectedUnit?.UnitID === editingUnit.UnitID) {
          setSelectedUnit((prev) => ({ ...prev, ...response.data }));
        }

        handleCancelEditUnit();
        Swal.fire("Success!", "Unit updated successfully", "success");
      } else {
        throw new Error(response?.message || "Failed to update unit");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
    });

    if (!result.isConfirmed) return;

    try {
      setUnits((prev) =>
        prev.map((unit) =>
          unit.UnitID === unitId ? { ...unit, delStatus: 1 } : unit
        )
      );
      setFilteredUnits((prev) =>
        prev.map((unit) =>
          unit.UnitID === unitId ? { ...unit, delStatus: 1 } : unit
        )
      );

      if (selectedUnit?.UnitID === unitId) {
        setSelectedUnit(null);
      }

      const response = await fetchData(
        "lmsEdit/deleteUnit",
        "POST",
        { unitId },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (!response?.success) {
        setUnits((prev) =>
          prev.map((unit) =>
            unit.UnitID === unitId ? { ...unit, delStatus: 0 } : unit
          )
        );
        setFilteredUnits((prev) =>
          prev.map((unit) =>
            unit.UnitID === unitId ? { ...unit, delStatus: 0 } : unit
          )
        );
        throw new Error(response?.message || "Failed to delete unit");
      }

      setUnits((prev) => prev.filter((unit) => unit.UnitID !== unitId));
      setFilteredUnits((prev) => prev.filter((unit) => unit.UnitID !== unitId));

      Swal.fire("Deleted!", "Unit has been deleted.", "success");
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error!", `Failed to delete unit: ${err.message}`, "error");
    }
  };

  const handleSaveUnitOrder = async (orderedUnits) => {
    try {
      const unitsWithOrder = orderedUnits.map((unit, index) => ({
        UnitID: unit.UnitID,
        SortingOrder: index + 1,
      }));

      const response = await fetchData(
        "lmsEdit/updateUnitOrder",
        "POST",
        { units: unitsWithOrder },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        const updatedUnits = [...units]
          .map((unit) => {
            const updatedUnit = unitsWithOrder.find(
              (u) => u.UnitID === unit.UnitID
            );
            return updatedUnit
              ? { ...unit, SortingOrder: updatedUnit.SortingOrder }
              : unit;
          })
          .sort((a, b) => {
            const orderA = a.SortingOrder || Number.MAX_SAFE_INTEGER;
            const orderB = b.SortingOrder || Number.MAX_SAFE_INTEGER;
            return orderA - orderB || a.UnitID - b.UnitID;
          });

        setUnits(updatedUnits);
        setFilteredUnits(
          updatedUnits.filter(
            (unit) => unit.SubModuleID === submodule.SubModuleID
          )
        );
        Swal.fire("Success!", "Unit order has been updated.", "success");
      } else {
        throw new Error(response?.message || "Failed to update unit order");
      }
    } catch (err) {
      console.error("Error updating unit order:", err);
      Swal.fire(
        "Error!",
        `Failed to update unit order: ${err.message}`,
        "error"
      );
    }
  };

  return {
    units,
    filteredUnits,
    loading,
    error,
    editingUnit,
    editedUnitData,
    isSaving,
    selectedUnit,
    setSelectedUnit,
    handleEditUnit,
    handleCancelEditUnit,
    handleUpdateUnit,
    handleDeleteUnit,
    handleSaveUnitOrder,
    fetchUnits,
  };
};